import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'test-project';

  public token: string | undefined;
  public errorText: string | undefined;


  constructor(private http: HttpClient) {

  }

  ngOnInit(): void {
    // Try to get the JWT from the local storage
    this.token = localStorage.getItem('lgcy-Token') as string;
  }

  logout() {
    // Delete all items from local storage to logout the user
    localStorage.clear();
    this.token = undefined;
  }


  async login() {

    // @ts-ignore
    if (window.lgcyWeb) { // check if the extension is installed and enabled
      // @ts-ignore
      if (window.lgcyWeb.defaultAddress.base58) { // do the technically connect
        this.errorText = undefined; // clear error message

        // @ts-ignore
        const lgcyWeb = window.lgcyWeb;
        const hex = this.genRanHex(128); // generate a hex value of size 128
        var signTx = await lgcyWeb.legacy.sign(hex) // sign the hex value with the chrome extension
        // @ts-ignore
        var address = window.lgcyWeb.defaultAddress.base58; // get the current address;

        this.http.post('https://apilg.lgcyscan.network/extension/ext-login', { // send all the data to the backend of lgcyscan to verify the signed hex values
          address,
          hexMessage: hex,
          signature: signTx
        })
          .pipe().subscribe(
          (response: any)  => {
            // success handler (HTTP status code 20x)
              console.log(response);
            localStorage.setItem('lgcy-Token', response.token); // store the JWT in the local storage
            this.token = response.token; // set the JWT globally
          }, error => {
            console.log(error); // some HTTP error (HTTP status codes 4xx and 5xx)
          }
        )
      } else {
        // extension is locked
        this.errorText = "please create wallet or restore wallet on extension";
      }
    } else {
      // extension not installed or disabled
      this.errorText = "please install lgcy extension";
    }

  }

  genRanHex(size: number) {
    // creates a random hex string of the given size
    const hex = '0123456789ABCDEF';
    let output = '';
    for (let i = 0; i < size; ++i) {
      output += hex.charAt(Math.floor(Math.random() * hex.length));
    }
    return output;
  }
}
