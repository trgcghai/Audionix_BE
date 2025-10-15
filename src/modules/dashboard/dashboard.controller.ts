import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from '@modules/dashboard/dto/dashboard-stats.dto';
import { Role } from '@enums/role.enum';
import { Roles } from '@decorators/roles.decorator';

@Controller('dashboard')
@Roles(Role.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get comprehensive dashboard statistics
   * @returns Dashboard statistics including user growth, top artists, likes data, and playlist data
   */
  @Get('stats')
  async getDashboardStats(): Promise<DashboardResponseDto> {
    return await this.dashboardService.getDashboardStats();
  }
}
