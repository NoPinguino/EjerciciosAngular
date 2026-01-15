import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageStore } from './message-store';

describe('MessageStore', () => {
  let component: MessageStore;
  let fixture: ComponentFixture<MessageStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageStore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageStore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
