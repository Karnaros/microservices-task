import { ArgumentMetadata, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";


@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, metadata: ArgumentMetadata) {
        if(!value) return;
        const obj = plainToClass(metadata.metatype, value);
        const errors = await validate(obj);

        if (errors.length) {
            let messages = errors.map(err => {
                return `${err.property} - ${Object.values(err.constraints).join(', ')}`
            })
            
            throw new RpcException({message: messages.join('; '), statusCode: HttpStatus.BAD_REQUEST});
        }
        return value;
        
    }
}
