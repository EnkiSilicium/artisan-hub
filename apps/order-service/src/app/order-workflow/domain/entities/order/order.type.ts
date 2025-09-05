import type {
  OrderStates,
  OrderActions,
} from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.enum';
import type { StateRegistry } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.state';
import type { OrderTransitions } from 'apps/order-service/src/app/order-workflow/domain/entities/order/order.transitions';

//Helper-types
type ConstructorType<T> = new (...args: any[]) => T;

export type CtorById = {
  [K in OrderStates]: (typeof StateRegistry)[K];
};

export type StateById = {
  [K in OrderStates]: InstanceType<(typeof StateRegistry)[K]>;
};

export type StateClassUnion = StateById[OrderStates];

//Important business-logic types
export type Handlers<S extends OrderStates> = {
  [A in NextActions<S>]: LegalOutcome<S, A>;
};
/**
 * Automatically computes legality of the transition on compile-time.
 */
export type Outcome<S extends OrderStates, A extends OrderActions> =
  A extends NextActions<S> ? LegalOutcome<S, A> : IllegalOutcome;

type TransitionsOf<S extends OrderStates> = (typeof OrderTransitions)[S];

export type NextActions<S extends OrderStates> = Extract<
  //Extraction removes undefined - compiler fix
  keyof TransitionsOf<S>,
  OrderActions
>;

type NextStateFor<S extends OrderStates, A extends NextActions<S>> = Extract<
  TransitionsOf<S>[A],
  OrderStates
>;

export interface AbstractOutcome {
  type: string;
  nextState: any;
}

export class LegalOutcomeS<s extends OrderStates, a extends NextActions<s>>
  implements AbstractOutcome
{
  type: 'legal';
  nextState: ConstructorType<BaseState<NextStateFor<s, a>>>;
}
export type LegalOutcome<S extends OrderStates, A extends NextActions<S>> = {
  type: 'legal';
  nextState: CtorById[NextStateFor<S, A>];
};

export class IllegalOutcome implements AbstractOutcome {
  type: 'illegal';
  nextState: undefined;
}

export abstract class BaseState<s extends OrderStates> {
  readonly stateName: s;
  abstract readonly handlers: Handlers<s>;

  /**
   * The return type is automatically computed to be either
   * LegalOutcome or IllegalOutcome by the compiler
   * */
  handle<a extends OrderActions>(action: a): Outcome<s, a> {
    function isKeyOf<T extends object, K extends PropertyKey>(
      obj: T,
      key: K,
    ): key is Extract<keyof T, K> {
      return key in obj;
    }

    let outcome:
      | LegalOutcome<s, Extract<keyof Handlers<s>, a>>
      | IllegalOutcome;
    if (isKeyOf(this.handlers, action)) {
      outcome = this.handlers[action];
    } else {
      outcome = { type: 'illegal', nextState: undefined };
    }
    return outcome as Outcome<s, a>;
  }
}
