import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDrawerComponent } from './app-drawer.component';

describe('AppDrawerComponent', () => {
  let component: AppDrawerComponent;
  let fixture: ComponentFixture<AppDrawerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppDrawerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
