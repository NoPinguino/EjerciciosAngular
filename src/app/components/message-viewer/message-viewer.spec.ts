import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageViewer } from './message-viewer';

describe('MessageViewer', () => {
  let component: MessageViewer;
  let fixture: ComponentFixture<MessageViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
