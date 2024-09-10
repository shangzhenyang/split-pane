import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../styles/SplitPane.module.css";
import classNames from "classnames";

interface SplitPaneProps {
  /**
   * Must render exactly two child components:
   * - The first will be shown in the left pane.
   * - The second will be shown in the right pane.
   */
  children: [JSX.Element, JSX.Element];

  /**
   * The initial size of the start (left) pane.
   * May be a percentage string like "50%" or a pixel value like `200`.
   * @default "50%"
   */
  initialSize?: string | number;

  /**
   * The minimum size of either pane. May be a percentage string like "50%" or a pixel value like
   * `200`.
   * @default 100
   */
  minSize?: string | number;
}

/**
 * Renders two vertical, resizable panes with a draggable divider between them. This
 * component can be rendered by itself or nested to an arbitrary depth (e.g., to support
 * three side-by-side panes).
 */
export function SplitPane({
  children,
  initialSize = "50%",
  minSize = 100,
}: SplitPaneProps) {
  const [leftPaneSize, setLeftPaneSize] = useState(initialSize);

  const dividerRef = useRef<HTMLDivElement>(null);
  const splitPaneRef = useRef<HTMLDivElement>(null);

  const isPercentage = (value: string): boolean => value.trim().endsWith("%");

  const isString = (value: number | string): value is string =>
    typeof value === "string";

  const isNegative = (value: number | string): boolean => {
    const number = isString(value) ? parseFloat(value) : value;
    return number < 0;
  };

  const validateSize = (size: string | number, label: string) => {
    if (isNaN(isString(size) ? parseFloat(size) : size)) {
      throw new Error(`${label} must be a number.`);
    }
    if (isNegative(size)) {
      throw new Error(`${label} must be a positive number.`);
    }
  };

  // validates props
  if (children.length !== 2) {
    throw new Error("SplitPane must have exactly two children.");
  }
  validateSize(initialSize, "initialSize");
  validateSize(minSize, "minSize");
  if (
    isString(minSize) &&
    isPercentage(minSize) &&
    parseFloat(minSize.replace("%", "")) > 50
  ) {
    throw new Error("minSize must be less than or equal to 50%.");
  }

  const convertPixelToPercentage = useCallback(
    (px: number | string): number => {
      if (!splitPaneRef.current) {
        return 0;
      }
      const splitPaneRect = splitPaneRef.current.getBoundingClientRect();
      const totalSize = splitPaneRect.width;
      if (typeof px === "string") {
        px = parseFloat(px);
      }
      let leftPaneSize = px - splitPaneRect.left;

      // avoids overflow
      const minPixel =
        isString(minSize) && isPercentage(minSize)
          ? (parseFloat(minSize.replace("%", "")) / 100) * totalSize
          : Number(minSize);
      if (leftPaneSize < minPixel) {
        leftPaneSize = minPixel;
      } else if (leftPaneSize > totalSize - minPixel) {
        leftPaneSize = totalSize - minPixel;
      }
      return (leftPaneSize / totalSize) * 100;
    },
    [minSize],
  );

  const getPercentage = (value: number | string): number => {
    if (isString(value) && isPercentage(value)) {
      // already a percentage
      return parseFloat(value.replace("%", ""));
    }
    return convertPixelToPercentage(value);
  };

  const handleMove = useCallback(
    (x: number) => {
      setLeftPaneSize(`${convertPixelToPercentage(x)}%`);
    },
    [convertPixelToPercentage],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!dividerRef.current) {
      return;
    }
    const dividerRect = dividerRef.current.getBoundingClientRect();
    if (event.key === "ArrowLeft") {
      handleMove(dividerRect.left - 10);
    } else if (event.key === "ArrowRight") {
      handleMove(dividerRect.left + 10);
    }
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      handleMove(event.clientX);
    },
    [handleMove],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      handleMove(event.touches[0].pageX);
    },
    [handleMove],
  );

  const removeEventListeners = useCallback(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", removeEventListeners);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", removeEventListeners);
  }, [handleMouseMove, handleTouchMove]);

  const handleMouseDown = () => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", removeEventListeners);
  };

  const handleTouchStart = () => {
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", removeEventListeners);
  };

  useEffect(() => {
    // removes event listeners when component unmounts
    return () => {
      removeEventListeners();
    };
  }, [removeEventListeners]);

  const isLeftPaneSizeInPercentage =
    isString(leftPaneSize) && isPercentage(leftPaneSize);
  const isMinSizeInPercentage = isString(minSize) && isPercentage(minSize);

  const ariaValueMin: number = getPercentage(minSize);
  const ariaValueNow: number = getPercentage(leftPaneSize);

  const containerMinWidth: number | undefined = isMinSizeInPercentage
    ? undefined
    : Number(minSize) * 2 + (dividerRef.current?.clientWidth || 0);

  const flexBasis: string = isLeftPaneSizeInPercentage
    ? leftPaneSize
    : `${leftPaneSize}px`;

  const minWidth: string = isMinSizeInPercentage ? minSize : `${minSize}px`;

  return (
    <div
      className={styles["split-pane-container"]}
      ref={splitPaneRef}
      style={{
        // avoids nested SplitPanes being unuseable when too small
        minWidth: containerMinWidth,
      }}
    >
      <div
        className={classNames(
          styles["split-pane-child"],
          styles["split-pane-left"],
        )}
        style={{
          flexBasis: flexBasis,
          minWidth: minWidth,
        }}
      >
        {children[0]}
      </div>
      <div
        aria-label="Resize pane"
        aria-orientation="horizontal"
        aria-valuemin={ariaValueMin}
        aria-valuemax={100 - ariaValueMin}
        aria-valuetext={`${ariaValueNow}% of the width`}
        aria-valuenow={ariaValueNow}
        className={styles["split-pane-divider"]}
        onContextMenu={removeEventListeners}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        ref={dividerRef}
        role="separator"
        tabIndex={0}
      ></div>
      <div
        className={styles["split-pane-child"]}
        style={{ minWidth: minWidth }}
      >
        {children[1]}
      </div>
    </div>
  );
}
