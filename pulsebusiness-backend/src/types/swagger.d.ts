declare module 'swagger-jsdoc' {
  import { OpenAPIV3 } from 'openapi-types';
  function swaggerJsdoc(options: any): OpenAPIV3.Document;
  export = swaggerJsdoc;
}

declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';
  import { OpenAPIV3 } from 'openapi-types';

  interface SwaggerUiOptions {
    explorer?: boolean;
    customCss?: string;
    customSiteTitle?: string;
    customfavIcon?: string;
    swaggerUrl?: string;
    customJs?: string;
    swaggerOptions?: any;
  }

  function serve(...args: any[]): RequestHandler[];
  function setup(specs: OpenAPIV3.Document, options?: SwaggerUiOptions): RequestHandler;

  export { serve, setup };
}
