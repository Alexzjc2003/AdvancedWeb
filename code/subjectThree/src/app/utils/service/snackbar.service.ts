import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  showMessage(message: string, panelClass: string): void {
    let config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = [panelClass]
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';
    this.snackBar.open(message, "", config);
  }
}
