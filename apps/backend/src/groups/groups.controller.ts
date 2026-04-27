import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/auth.guard'
import { GroupsService } from './groups.service'
import { CreateGroupDTO } from './dto/CreateGroup'

@Controller('groups')
export class GroupsController {

    constructor(private readonly groupsService: GroupsService){}

    @Post('new')
    @Auth()
    @ApiOperation({ summary: 'Create new group' })
    @ApiBody({ type: CreateGroupDTO })
    @ApiResponse({ status: 201, description: 'Created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    async sendExample(@Body() body: CreateGroupDTO, @CurrentUser() user: {id: string, isAdmin: boolean}) {
        return this.groupsService.create(body, user)
    }
}
