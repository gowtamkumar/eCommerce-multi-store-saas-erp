import { SwaggerModule } from "@nestjs/swagger";
import { DocumentBuilder } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";


export const SwaggerConfig = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('eCommerce Multi Tenant SaaS')
        .setDescription('The eCommerce Multi Tenant SaaS API description')
        .setVersion('1.0')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory)
}