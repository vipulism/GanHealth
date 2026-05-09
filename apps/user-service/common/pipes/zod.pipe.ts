import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { z, ZodSchema } from "zod";

export class ZodValidationPipe<TSchema extends ZodSchema> implements PipeTransform<unknown, z.infer<TSchema>> {
    constructor(private readonly schema: TSchema) { }

    transform(value: unknown, _metadata: ArgumentMetadata): z.infer<TSchema> {
        const result = this.schema.safeParse(value);
        if (!result.success) {
          throw new BadRequestException(result.error.flatten());
        }
        return result.data;
      }
    }