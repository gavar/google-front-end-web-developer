import { ComponentType } from "react";

/**
 * Configure default properties of the react component.
 * @see ComponentClass#defaultProps
 * @param props - properties to merge with existing default properties.
 */
export function withDefaultProps<P>(props: Partial<P>): WithDefaultProps<P> {
  stack.push(props);
  return annotate as any;
}

export interface WithDefaultProps<P> {
  <C extends ComponentType<P>>(component: C);
}

const stack = [];

function annotate<P>(prototype: ComponentType<P>) {
  const props = stack.pop() as Partial<P>;
  if (prototype.defaultProps) Object.assign(prototype.defaultProps, props);
  else prototype.defaultProps = props;
}
