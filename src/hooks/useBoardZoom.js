import { useEffect, useRef, useState } from 'react';

const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.6;
const ZOOM_STEP = 0.1;

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function useBoardZoom() {
  const viewportRef = useRef(null);
  const gridRef = useRef(null);
  const zoomRef = useRef(1);
  const zoomModeRef = useRef('fit');
  const [zoom, setZoom] = useState(1);
  const [zoomMode, setZoomMode] = useState('fit');

  zoomRef.current = zoom;
  zoomModeRef.current = zoomMode;

  function calculateFitZoom() {
    const viewport = viewportRef.current;
    const grid = gridRef.current;

    if (!viewport || !grid) {
      return null;
    }

    const currentZoom = zoomRef.current || 1;
    const baseWidth = grid.offsetWidth / currentZoom;
    const baseHeight = grid.offsetHeight / currentZoom;

    if (!baseWidth || !baseHeight) {
      return null;
    }

    const widthRatio = viewport.clientWidth / baseWidth;
    const heightRatio = viewport.clientHeight / baseHeight;

    return clampZoom(Math.min(widthRatio, heightRatio));
  }

  function fitBoard() {
    const nextZoom = calculateFitZoom();

    if (nextZoom) {
      setZoom(nextZoom);
    }
  }

  function handleZoomIn() {
    setZoomMode('manual');
    setZoom((currentZoom) => clampZoom(currentZoom + ZOOM_STEP));
  }

  function handleZoomOut() {
    setZoomMode('manual');
    setZoom((currentZoom) => clampZoom(currentZoom - ZOOM_STEP));
  }

  function handleFitBoard() {
    setZoomMode('fit');
    fitBoard();
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    const grid = gridRef.current;

    if (!viewport || !grid) {
      return undefined;
    }

    fitBoard();

    const resizeObserver = new ResizeObserver(() => {
      if (zoomModeRef.current === 'fit') {
        fitBoard();
      }
    });

    resizeObserver.observe(viewport);
    resizeObserver.observe(grid);

    return () => resizeObserver.disconnect();
  }, [zoomMode]);

  return {
    zoom,
    viewportRef,
    gridRef,
    handleZoomIn,
    handleZoomOut,
    handleFitBoard,
  };
}
