import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageSender } from './message-sender';

describe('MessageSender', () => {
  let component: MessageSender;
  let fixture: ComponentFixture<MessageSender>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageSender]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageSender);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
