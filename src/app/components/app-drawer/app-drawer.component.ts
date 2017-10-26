import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-drawer',
  templateUrl: './app-drawer.component.html',
  styleUrls: ['./app-drawer.component.scss']
})
export class AppDrawerComponent implements OnInit {

  private isShown = false;

  constructor() { }

  ngOnInit() {
  }

  close(){
      this.isShown = false;
  }

  open(){
      this.isShown = true;
  }

  toggle(){
      this.isShown = !this.isShown;
  }

  item(ev) {
      console.log(ev);
      ev.stopPropagation();
  }
}
