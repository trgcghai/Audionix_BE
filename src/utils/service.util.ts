// src/common/utils/base.service.ts
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { PaginatedResponse } from 'src/common/interfaces/response.interfaces';

@Injectable()
export class BaseService<T> {
  constructor(private readonly model: Model<T>) {}

  async findAll(
    query: Record<string, any>,
    limit: number,
    current: number,
  ): Promise<PaginatedResponse<T>> {
    const { filter, sort } = aqp(query);

    if (filter.limit) delete filter.limit;
    if (filter.current) delete filter.current;

    const totalItems = await this.model.countDocuments(filter).exec();
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (current - 1) * limit;

    const result = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort as Record<string, 1 | -1>)
      .exec();

    return {
      items: result,
      totalItems,
      totalPages,
      current: parseInt(current.toString()),
      limit: parseInt(limit.toString()),
    };
  }
}
