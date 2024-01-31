import { Component, Input, Signal, WritableSignal, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AppStateService } from 'src/app/services/app-state.service';
import { MatExpansionModule } from '@angular/material/expansion';

import {
  ExpStageKind,
  Experiment,
  STAGE_KIND_CHAT,
  UserData,
  UserProfile,
} from 'src/lib/staged-exp/data-model';
import { MediatorChatComponent } from '../mediator-chat/mediator-chat.component';

// TODO: generalise into a senisble class for viewing all relevant info on
// where participants are at w.r.t. this stage.
export interface StageState {
  name: string;
  kind: ExpStageKind;
  participants: UserProfile[];
}

@Component({
  selector: 'app-experiment-monitor',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive, MediatorChatComponent, MatExpansionModule],
  templateUrl: './experiment-monitor.component.html',
  styleUrl: './experiment-monitor.component.scss',
})
export class ExperimentMonitorComponent {
  public experimentName: WritableSignal<string> = signal('');
  public participants: Signal<UserData[]>;

  @Input()
  set experiment(name: string) {
    this.experimentName.set(name);
  }

  public stageStates: Signal<StageState[]>;

  readonly STAGE_KIND_CHAT = STAGE_KIND_CHAT;

  constructor(public stateService: AppStateService) {
    this.participants = computed(() => {
      console.log('experimentName:', this.experimentName());
      if (!(this.experimentName() in this.stateService.data().experiments)) {
        return [];
      }
      const exp = this.stateService.data().experiments[this.experimentName()];
      return Object.values(exp.participants);
    });

    // TODO: factor into service?
    this.stageStates = computed(() => {
      const participant0 = this.participants()[0];
      const stageStateMap: { [stageName: string]: StageState } = {};
      const stageStates: StageState[] = [
        ...participant0.completedStageNames,
        participant0.workingOnStageName,
        ...participant0.futureStageNames,
      ].map((name) => {
        const kind = participant0.stageMap[name].kind;
        return {
          name,
          kind,
          participants: [],
        };
      });
      stageStates.forEach((s) => (stageStateMap[s.name] = s));
      this.participants().forEach((p) => {
        if (p.workingOnStageName in stageStateMap) {
          stageStateMap[p.workingOnStageName].participants.push(p.profile);
        } else {
          throw new Error(`stage not in the first participants stages: ${p.workingOnStageName}`);
        }
      });
      return stageStates;
    });
  }
}
