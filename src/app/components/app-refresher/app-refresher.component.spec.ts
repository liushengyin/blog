import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRefresherComponent } from './app-refresher.component';

describe('AppRefresherComponent', () => {
  let component: AppRefresherComponent;
  let fixture: ComponentFixture<AppRefresherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppRefresherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppRefresherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
