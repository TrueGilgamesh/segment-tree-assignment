function recursiveSegmentTree(array, fn, A, isRootArray) {
  const rootArray = isRootArray ? array : [array];

  return function(from, to) {
    const result = rootArray
      .map(function(array) {
        return array.slice(from, to);
      })
      .reduce(function(newArray, array) {
        return newArray.concat(array);
      }, []);

    if (result[0] instanceof Array) {
      return recursiveSegmentTree(result, fn, A, true);
    } else {
      return result.reduce(fn, A);
    }
  };
}

function sum(a, b) {
  return a + b;
}

function test1() {
  let array = [1, 2, 3, 4];

  let tree = recursiveSegmentTree(array, sum, 0);

  console.log(tree(0, 1)); // 1
  console.log(tree(0, 2)); // 3
  console.log(tree(0, 4)); // 10
}

function test2() {
  let array = [[1, 0, 1, 1], [0, 1, 0, 0], [0, 0, 0, 1], [1, 1, 1, 1]];

  let tree = recursiveSegmentTree(array, sum, 0);

  console.log(tree(0, 1)(0, 1)); // вернет 1
  console.log(tree(0, 4)(0, 4)); // вернет 9
  console.log(tree(3, 4)(3, 4)); // вернет 1
  console.log(tree(2, 3)(2, 3)); // вернет 0
}

function test3() {
  let array = [
    [[0, 1], [0, 0], [1, 1], [0, 0]],
    [[0, 0], [1, 0], [1, 0], [0, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 0]],
    [[1, 0], [0, 0], [0, 0], [0, 0]]
  ];

  let tree = recursiveSegmentTree(array, sum, 0);

  console.log(tree(0, 1)(0, 1)(0, 1)); // вернет 0
  console.log(tree(2, 3)(0, 4)(0, 2)); // вернет 3
  console.log(tree(0, 4)(2, 3)(0, 2)); // вернет 4
  console.log(tree(0, 4)(0, 4)(0, 2)); // вернет 10
}

test1();
test2();
test3();
