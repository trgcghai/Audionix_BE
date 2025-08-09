// src/common/utils/base.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';
import { PaginatedResponse } from '@common/interfaces/response.interface';

@Injectable()
export class BaseService<T> {
  constructor(private readonly model: Model<T>) {}

  /**
   * Find all documents with pagination and optional filtering, sorting, and population.
   * @param query - The query object containing filter, sort, limit, and current page.
   * @param limit - The maximum number of items to return (default is 10).
   * @param current - The current page number (default is 1).
   * @param populate - Fields to populate in the result (optional).
   * @param except - Fields to exclude from the result (optional).
   * @returns A paginated response containing items, total items, total pages, current page
   */
  async findAll(
    query: Record<string, any>,
    limit: number = 10,
    current: number = 1,
    populate?: string | string[],
    except?: string | string[],
    regexFields?: string[],
  ): Promise<PaginatedResponse<T>> {
    const { filter, sort } = aqp(query);

    if (filter.limit) delete filter.limit;
    if (filter.current) delete filter.current;

    if (regexFields) {
      for (const field of regexFields) {
        if (filter[field]) {
          filter[field] = {
            $regex: new RegExp(filter[field], 'i'),
          };
        }
      }
    }

    const totalItems = await this.model.countDocuments(filter).exec();
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (current - 1) * limit;

    let mongooseQuery = this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort as Record<string, 1 | -1>);

    // Xử lý populate
    if (populate) {
      const fields = Array.isArray(populate) ? populate : [populate];
      for (const field of fields) {
        mongooseQuery = mongooseQuery.populate(field);
      }
    }

    // Xử lý except -> chuyển về chuỗi '-field1 -field2'
    if (except) {
      const fields = Array.isArray(except) ? except : [except];
      const selectString = fields.map((f) => `-${f}`).join(' ');
      mongooseQuery = mongooseQuery.select(selectString);
    }

    const result = await mongooseQuery.exec();

    return {
      items: result,
      totalItems,
      totalPages,
      current: parseInt(current.toString()),
      limit: parseInt(limit.toString()),
    };
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const item = await this.model.findOne({ _id: id }).exec();

    if (!item) {
      throw new NotFoundException(`${this.model.modelName} not found`);
    }

    return {
      item,
    };
  }

  async findMany(ids: string[]) {
    for (const id of ids) {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
    }

    const items = await this.model.find({ _id: { $in: ids } }).exec();

    if (items.length === 0) {
      throw new NotFoundException(`${this.model.modelName} not found`);
    }

    return {
      items,
    };
  }

  async remove(...ids: string[]) {
    for (const id of ids) {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
    }

    const result = await this.model.deleteMany({ _id: { $in: ids } }).exec();

    return {
      deletedCount: result.deletedCount,
      message:
        result.deletedCount > 0
          ? `${this.model.modelName} deleted successfully`
          : `${this.model.modelName} not found`,
    };
  }
}
