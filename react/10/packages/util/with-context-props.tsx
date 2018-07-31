import React, {ComponentClass, Context, StatelessComponent} from "react";

/**
 * Enhance component to use properties from a context/
 * @param context - context to consume.
 * @param selector - function returning object to merge into a properties.
 */
export function withContextProps<C, P>(context: Context<C>, selector: WithContextPropsSelector<C, P>): WithContextProps<P> {
    stack.push(context, selector);
    return annotate as any;
}

interface WithContextPropsSelector<T, P> {
    (value: T): Partial<P>;
}

export interface WithContextProps<P> {
    <P>(component: ComponentClass<P>);
}

const stack = [];

function annotate<C, P>(component: ComponentClass<P>): StatelessComponent<P> {
    const selector: WithContextPropsSelector<C, P> = stack.pop();
    const context: Context<C> = stack.pop();
    return function (props: P) {
        function ContextConsumer(value: C) {
            const contextProps = selector(value);
            return React.createElement(component, {
                ...contextProps as object,
                ...props as any,
            });
        }
        return <context.Consumer>
            {ContextConsumer}
        </context.Consumer>;
    };
}


