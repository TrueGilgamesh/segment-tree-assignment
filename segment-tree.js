function dummySegmentTree(array, fn, N) {
  return function(from, to) {
    let result = N;

    for (let i = from; i < to; i++) {
      result = fn(result, array[i]);
    }

    return result;
  };
}

function segmentTree(array, fn, N) {
  return function(from, to) {
    if (from < 0 || to > array.length) {
      throw new Error('Индексы выходят за границы диапазона');
    }

    if (from > to) {
      throw new Error('Левый индекс границы диапазона больше правого');
    }

    return array.slice(from, to).reduce(fn, N);
  };
}

function recursiveSegmentTree(array, fn, N, isRootArray) {
  const rootArray = isRootArray ? array : [array];

  return function(from, to) {
    const result = rootArray
      .map(function(array) {
        if (from < 0 || to > array.length) {
          throw new Error('Индексы выходят за границы диапазона');
        }

        if (from > to) {
          throw new Error('Левый индекс границы диапазона больше правого');
        }

        return array.slice(from, to);
      })
      .reduce(function(newArray, array) {
        return newArray.concat(array);
      }, []);

    if (result[0] instanceof Array) {
      return recursiveSegmentTree(result, fn, N, true);
    } else {
      return result.reduce(fn, N);
    }
  };
}

function getElfTree(array) {
  return recursiveSegmentTree(array, sum, 0);
}

function assignEqually(tree, wishes, stash, elves, gems, week) {
  // все камни
  let allGems = 0;

  // считаем, сколько камней у каждого эльфа
  const elvesGems = elves.map(function(elf, elfId) {
    const elfGems = tree(elfId, elfId + 1)(0, gems.length)(0, week);

    // попутно считаем, сколько камней всего
    allGems += elfGems;

    return elfGems;
  });

  // сколько камней в запасе
  let stashGems = Object.keys(stash).reduce(function(stashGems, gem) {
    return stashGems + stash[gem];
  }, 0);

  // сколько будет всего камней после распределения
  const totalGems = allGems + stashGems;

  // равная доля - сколько должно стать камней у каждого после распределения
  // (берём бо́льшую целую часть) все камни после распределения / кол-во эльфов
  const equalPart = Math.ceil(totalGems / elves.length);

  // сколько нужно раздать камней каждому эльфу
  const gemsToAssign = elvesGems.map(function(elfGems) {
    return equalPart - elfGems;
  });

  // копия запаса, чтобы не изменять переданный по ссылке объект
  const stashCopy = {};

  // заполняем копию запаса
  Object.keys(stash).forEach(function(gem) {
    stashCopy[gem] = stash[gem];
  });

  // распределение
  const assignment = {};

  // раздаём каждому эльфу камни
  elves.forEach(function(elf, elfId) {
    // распределение эльфа
    const elfAssignment = {};

    // сколько нужно выдать эльфу
    const gemsNumberToAssign = gemsToAssign[elfId];

    // сколько уже выдали эльфу
    let gemsAssigned = 0;

    // пока не выдали всё причитающееся эльфу и есть камни
    while (gemsAssigned < gemsNumberToAssign && stashGems > 0) {
      // перебираем все камни в запасе
      for (gem in stashCopy) {
        // берём камень из запаса
        stashCopy[gem]--;

        // если все камни такого вида раздали
        if (stashCopy[gem] === 0) {
          // удаляем свойство камня, чтобы не перебирать напрасно
          delete stashCopy[gem];
        }

        // уменьшаем общее количество комней в запасе
        stashGems--;

        // если ещё не выдавали таких камней эльфу
        if (elfAssignment[gem] === undefined) {
          // добавим камень с нулём
          elfAssignment[gem] = 0;
        }

        // даём эльфу один такой камень
        elfAssignment[gem]++;

        // считаем его ко всем выданным эльфу
        gemsAssigned++;

        // если уже выдали эльфу сколько нужно
        if (gemsAssigned === gemsNumberToAssign) {
          // прекращаем перебирать камни в запасе
          break;
        }
      }
    }

    // добавляем распределение эльфа в распределение
    assignment[elf] = elfAssignment;
  });

  return assignment;
}

function assignAtLeastOne(tree, wishes, stash, elves, gems, week) {
  // все камни
  let allGems = 0;

  // считаем, сколько камней у каждого эльфа
  const elvesGems = elves.map(function(elf, elfId) {
    const elfGems = tree(elfId, elfId + 1)(0, gems.length)(0, week);

    // попутно считаем, сколько камней всего
    allGems += elfGems;

    return elfGems;
  });

  // сколько камней в запасе
  let stashGems = Object.keys(stash).reduce(function(stashGems, gem) {
    return stashGems + stash[gem];
  }, 0);

  // сколько будет всего камней после распределения
  const totalGems = allGems + stashGems;

  // сколько должно быть у каждого после раздачи поровну,
  // не считая одного обязательного камня на каждого
  const equalPart = Math.floor((totalGems - elves.length) / elves.length);

  // сколько нужно раздать камней каждому эльфу
  const gemsToAssign = elvesGems.map(function(elfGems) {
    // как минимум один, плюс то, что можем раздать равномерно
    return Math.max(equalPart - elfGems + 1, 1);
  });

  // копия запаса, чтобы не изменять переданный по ссылке объект
  const stashCopy = {};

  // заполняем копию запаса
  Object.keys(stash).forEach(function(gem) {
    stashCopy[gem] = stash[gem];
  });

  // распределение
  const assignment = {};

  // раздаём каждому эльфу камни
  elves.forEach(function(elf, elfId) {
    // распределение эльфа
    const elfAssignment = {};

    // сколько нужно выдать эльфу
    const gemsNumberToAssign = gemsToAssign[elfId];

    // сколько уже выдали эльфу
    let gemsAssigned = 0;

    // пока не выдали всё причитающееся эльфу или есть камни
    while (gemsAssigned < gemsNumberToAssign && stashGems > 0) {
      // перебираем все камни в запасе
      for (gem in stashCopy) {
        // берём камень из запаса
        stashCopy[gem]--;

        // если все камни такого вида раздали
        if (stashCopy[gem] === 0) {
          // удаляем свойство камня, чтобы не перебирать напрасно
          delete stashCopy[gem];
        }

        // уменьшаем общее количество комней в запасе
        stashGems--;

        // если ещё не выдавали таких камней эльфу
        if (elfAssignment[gem] === undefined) {
          // добавим камень с нулём
          elfAssignment[gem] = 0;
        }

        // даём эльфу один такой камень
        elfAssignment[gem]++;

        // считаем его ко всем выданным эльфу
        gemsAssigned++;

        // если уже выдали эльфу сколько нужно
        if (gemsAssigned === gemsNumberToAssign) {
          // прекращаем перебирать камни в запасе
          break;
        }
      }
    }

    // добавляем распределение эльфа в распределение
    assignment[elf] = elfAssignment;
  });

  return assignment;
}

function assignPreferredGems(tree, wishes, stash, elves, gems) {
  // сколько камней в запасе
  let stashGems = Object.keys(stash).reduce(function(stashGems, gem) {
    return stashGems + stash[gem];
  }, 0);

  /**
   * Детальное пожелание.
   * @typedef {Object} DetailedWish
   * @property {number} elfId - Индекс эльфа.
   * @property {number} gemId - Индекс камня.
   * @property {number} index - Показатель желания.
   */

  /** Массив объектов, представляющих пожелания каждого эльфа по каждому камню.
   * @type {DetailedWish[]}
   */
  const allWishes = [];

  // проходим по пожеланиям всех эльфов
  wishes.forEach(function(elfWishes, elfId) {
    // проходим по пожеланиям каждого камня эльфа
    elfWishes.forEach(function(wish, gemId) {
      // если такой камень есть в запасе
      if (stash[gems[gemId]] !== undefined) {
        // добавляем детализированную запись в массив
        allWishes.push({ elfId: elfId, gemId: gemId, index: wish });
      }
    });
  });

  // упорядочиваем по убыванию показателя желания
  allWishes.sort(function(a, b) {
    return a.index > b.index ? -1 : 1;
  });

  // копия запаса, чтобы не изменять переданный по ссылке объект
  const stashCopy = {};

  // заполняем копию запаса
  Object.keys(stash).forEach(function(gem) {
    stashCopy[gem] = stash[gem];
  });

  // распределение
  const assignment = {};

  // сразу добавляем пустое распределение для каждого эльфа
  elves.forEach(function(elf) {
    assignment[elf] = {};
  });

  // распределяем в порядке убывания желания
  for (const key in allWishes) {
    const detailedWish = allWishes[key];

    const gem = gems[detailedWish.gemId];
    const elf = elves[detailedWish.elfId];
    const elfAssignment = assignment[elf];

    // если есть ещё такие камни в запасе
    if (stashCopy[gem] !== undefined) {
      // вычитаем количество этих камней из количества в запасе
      stashGems -= stashCopy[gem];

      // назначаем эльфу все эти камни
      elfAssignment[gem] = stashCopy[gem];

      // удаляем этот камень из запаса
      delete stashCopy[gem];
    }

    // если уже всё раздали
    if (stashGems === 0) {
      // прерываем цикл
      break;
    }
  }

  return assignment;
}

function nextState(state, assignment, elves, gems) {
  // по каждому эльфу
  state.forEach(function(elfGems, elfId) {
    // Имя эльфа по индексу
    const elf = elves[elfId];

    // Распределение по эльфу
    const elfAssignment = assignment[elf];

    // по каждому типу камня эльфа
    elfGems.forEach(function(gemWeeks, gemId) {
      // Имя камня по индексу
      const gem = gems[gemId];

      // если есть назначение по этому эльфу и ему назначены такие камни
      if (elfAssignment !== undefined && elfAssignment[gem] !== undefined) {
        // добавим назначенное количество таких камней в новой неделе
        gemWeeks.push(elfAssignment[gem]);
      } else {
        // иначе добавим 0 таких камней в новой неделе
        gemWeeks.push(0);
      }
    });
  });

  // console.log(state);

  return state;
}
