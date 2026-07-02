import { Body, Controller, Logger, Post } from '@nestjs/common'
import { CreateStoreDto } from './dto/create-store.dto'
import { StoreService } from './store.service'
import { Public } from '@/common/decorators/public.decorator'

// Public: self-service store signup must be reachable by unauthenticated users.
@Public()
@Controller('onboard')
export class OnboardController {
  private readonly logger = new Logger(OnboardController.name)

  constructor(private readonly storeService: StoreService) {}

  @Post()
  async onboard(@Body() createStoreDto: CreateStoreDto) {
    this.logger.verbose('onboard called.')
    const result = await this.storeService.createStore(createStoreDto as CreateStoreDto)
    return {
      success: true,
      message: 'Store created successfully',
      subdomain: result.store.subdomain,
    }
  }
}
