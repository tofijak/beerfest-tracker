import { cloneElement, forwardRef } from "react";
import { Transition } from "react-transition-group";

const ON_MS = 480;
const OFF_MS = 360;

/** Dialog transition: old CRT TV switching on (line → full screen) and off (collapse to a dot). */
export const CrtTransition = forwardRef(function CrtTransition(props, ref) {
  const { children, in: inProp, timeout: _timeout, appear = true, ...other } = props;
  return (
    <Transition appear={appear} in={inProp} timeout={{ enter: ON_MS, exit: OFF_MS }} {...other}>
      {(state, childProps) =>
        cloneElement(children, {
          ref,
          ...childProps,
          style: {
            ...children.props.style,
            visibility: state === "exited" && !inProp ? "hidden" : undefined,
            animation:
              state === "exiting"
                ? `crtOff ${OFF_MS}ms ease-in forwards`
                : state === "exited"
                  ? "none"
                  : `crtOn ${ON_MS}ms ease-out`,
          },
        })
      }
    </Transition>
  );
});
