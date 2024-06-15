import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor() { }

  showMessage(message: string, panelClass: string): void {
    const snackbar = document.createElement('div');
    snackbar.className = `snackbar ${panelClass}`;
    snackbar.innerText = message;

    document.body.appendChild(snackbar);

    setTimeout(() => {
      snackbar.classList.add('show');
    }, 100);

    setTimeout(() => {
      snackbar.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(snackbar);
      }, 300);
    }, 3000);
  }
}


// import { Injectable } from '@angular/core';
// import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

// @Injectable({
//   providedIn: 'root'
// })
// export class SnackbarService {

//   constructor(private snackBar: MatSnackBar) { }

//   showMessage(message: string, panelClass: string): void {
//     let config = new MatSnackBarConfig();
//     config.duration = 3000;
//     config.panelClass = [panelClass]
//     config.horizontalPosition = 'center';
//     config.verticalPosition = 'top';
//     this.snackBar.open(message, "", config);
//   }
// }
