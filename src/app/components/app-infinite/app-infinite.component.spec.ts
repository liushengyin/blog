import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppInfiniteComponent } from './app-infinite.component';

describe('AppInfiniteComponent', () => {
  let component: AppInfiniteComponent;
  let fixture: ComponentFixture<AppInfiniteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppInfiniteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppInfiniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
