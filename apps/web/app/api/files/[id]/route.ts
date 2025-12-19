import { NextRequest, NextResponse } from 'next/server';
import { GetFileParams, GetFileParamsSchema } from './get-file.request';
import {
  UpdateFileParams,
  UpdateFileParamsSchema,
  UpdateFileRequestSchema,
} from './update-file.request';
import { UpdateFileCommand, UpdateFileFacade } from './update-file.facade';
import { GetFileFacade } from './get-file.facade';

export async function GET(_req: NextRequest, { params }: { params: Promise<GetFileParams> }) {
  try {
    const request = GetFileParamsSchema.parse(params);
    const facade = new GetFileFacade();
    const response = await facade.get(request);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<UpdateFileParams> }) {
  try {
    const { id } = UpdateFileParamsSchema.parse(await params);
    const body = await req.json();
    const request = UpdateFileRequestSchema.parse(body);
    const facade = new UpdateFileFacade();
    await facade.update({
      id,
      content: request.content,
      path: request.path,
    } satisfies UpdateFileCommand);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}
