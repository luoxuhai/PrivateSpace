function chunkArray(array = [], size) {
  if (array === []) return [];
  return array.reduce((acc, val) => {
    if (acc.length === 0) acc.push([]);
    const last = acc[acc.length - 1];
    if (last.length < size) {
      last.push(val);
    } else {
      acc.push([val]);
    }
    return acc;
  }, []);
}

function calculateDimensions({
  itemDimension,
  staticDimension,
  totalDimension,
  fixed,
  spacing,
}) {
  const usableTotalDimension = staticDimension || totalDimension;
  const availableDimension = usableTotalDimension - spacing; // One spacing extra
  const itemTotalDimension = Math.min(
    itemDimension + spacing,
    availableDimension,
  ); // itemTotalDimension should not exceed availableDimension
  const itemsPerRow = Math.floor(availableDimension / itemTotalDimension);
  const containerDimension = availableDimension / itemsPerRow;

  let fixedSpacing;
  if (fixed) {
    fixedSpacing =
      (totalDimension - itemDimension * itemsPerRow) / (itemsPerRow + 1);
  }

  return {
    itemTotalDimension,
    availableDimension,
    itemsPerRow,
    containerDimension,
    fixedSpacing,
  };
}

function generateStyles({
  itemDimension,
  containerDimension,
  spacing,
  fixed,
  fixedSpacing,
  horizontal = false,
  externalGutter = true,
}) {
  let rowStyle = {
    flexDirection: 'row',
    paddingLeft: externalGutter ? (fixed ? fixedSpacing : spacing) : 0,
    paddingBottom: spacing,
  };

  let containerStyle = {
    flexDirection: 'column',
    justifyContent: 'center',
    width: fixed
      ? itemDimension
      : containerDimension - (externalGutter ? spacing : 0),
    marginRight: fixed ? fixedSpacing : spacing,
  };

  if (horizontal) {
    rowStyle = {
      flexDirection: 'column',
      paddingTop: fixed ? fixedSpacing : spacing,
      paddingRight: spacing,
    };

    containerStyle = {
      flexDirection: 'row',
      justifyContent: 'center',
      height: fixed ? itemDimension : containerDimension - spacing,
      marginBottom: fixed ? fixedSpacing : spacing,
    };
  }

  return {
    containerStyle,
    rowStyle,
  };
}

export { chunkArray, calculateDimensions, generateStyles };
