import { onBeforeUnmount } from 'vue';
import { UiLibrary } from './../../ui-library/use';

class CreateUiLibrary extends UiLibrary {}

let myUiLibraryContext: CreateUiLibrary;

export const createUiLibraryContext = function (): CreateUiLibrary {
  myUiLibraryContext = new CreateUiLibrary();
  myUiLibraryContext.install();
  onBeforeUnmount(() => {
    myUiLibraryContext.uninstall();
  });
  return myUiLibraryContext;
};

export const useUiLibraryContext = function (): CreateUiLibrary {
  return myUiLibraryContext;
};
