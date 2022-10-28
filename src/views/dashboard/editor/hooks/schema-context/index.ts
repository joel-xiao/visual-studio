import { onBeforeUnmount } from 'vue';
import { Schema } from './../../schema/use';

class CreateSchema extends Schema {}

let mySchemaContext: CreateSchema;

export const createSchemaContext = function (): CreateSchema {
  mySchemaContext = new CreateSchema();
  mySchemaContext.install();
  onBeforeUnmount(() => {
    mySchemaContext.uninstall();
  });
  return mySchemaContext;
};

export const useSchemaContext = function (): CreateSchema {
  return mySchemaContext;
};
