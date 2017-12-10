import { ErrorHandler } from '@angular/core';
import { environment } from '../../environments/environment';

export class MyErrorHandler extends ErrorHandler {
  constructor() {
    super(false);
  }
  /**
   * @internal
   */
  handleError(err: any): void {
    super.handleError(err);
      this.sendError(err);
  }

  sendError(err:any) {
    // TODO
  }

}
