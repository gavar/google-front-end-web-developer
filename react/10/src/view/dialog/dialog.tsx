import React, {Component, DialogHTMLAttributes} from "react";

export interface DialogProps extends DialogHTMLAttributes<HTMLDialogElement> {

}

export class Dialog extends Component<DialogProps> {

    /** @inheritDoc */
    render() {
        const {open, children, ...other} = this.props;
        return <dialog open={open} {...other}>
            {children}
        </dialog>;
    }
}
