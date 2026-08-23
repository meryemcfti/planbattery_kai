export const uuidParam = (name: string) => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" }
});

export const dataResponse = (schemaRef: string) => ({
  description: "Success",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: { $ref: schemaRef }
        },
        required: ["data"]
      }
    }
  }
});

export const collectionResponse = (schemaRef: string) => ({
  description: "Success",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: schemaRef }
          }
        },
        required: ["data"]
      }
    }
  }
});

export const jsonBody = (schemaRef: string) => ({
  required: true,
  content: {
    "application/json": {
      schema: { $ref: schemaRef }
    }
  }
});

export const errorResponses = {
  "400": { $ref: "#/components/responses/BadRequest" },
  "404": { $ref: "#/components/responses/NotFound" },
  "409": { $ref: "#/components/responses/Conflict" },
  "500": { $ref: "#/components/responses/InternalServerError" }
};
