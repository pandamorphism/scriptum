/*
                                                                                      
                                                   I8                                 
                                                   I8                                 
                                 gg             88888888                              
                                 ""                I8                                 
   ,g,       ,gggg,   ,gggggg,   gg   gg,gggg,     I8   gg      gg   ,ggg,,ggg,,ggg,  
  ,8'8,     dP"  "Yb  dP""""8I   88   I8P"  "Yb    I8   I8      8I  ,8" "8P" "8P" "8, 
 ,8'  Yb   i8'       ,8'    8I   88   I8'    ,8i  ,I8,  I8,    ,8I  I8   8I   8I   8I 
,8'_   8) ,d8,_    _,dP     Y8,_,88,_,I8 _  ,d8' ,d88b,,d8b,  ,d8b,,dP   8I   8I   Yb,
P' "YY8P8PP""Y8888PP8P      `Y88P""Y8PI8 YY88888P8P""Y88P'"Y88P"`Y88P'   8I   8I   `Y8
                                      I8                                              
                                      I8                                              
                                      I8                                              
*/


/******************************************************************************
*******************************************************************************
*********************************[ CONSTANTS ]*********************************
*******************************************************************************
******************************************************************************/


const NOT_FOUND = -1;


const TYPE = Symbol.toStringTag;


/******************************************************************************
*******************************************************************************
**********************************[ ERRORS ]***********************************
*******************************************************************************
******************************************************************************/


class ExtendableError extends Error {
  constructor(s) {
    super(s);
    this.name = this.constructor.name;

    if (typeof Error.captureStackTrace === "function")
      Error.captureStackTrace(this, this.constructor);
    
    else
      this.stack = (new Error(s)).stack;
  }
};


class ScriptumError extends ExtendableError {};
    

/***[Subclasses]**************************************************************/


class DateError extends ScriptumError {};


class EnumError extends ScriptumError {};


class FileError extends ScriptumError {};


class RegExpError extends ScriptumError {};


class SemigroupError extends ScriptumError {};


class UnionError extends ScriptumError {};


/******************************************************************************
*******************************************************************************
***************************[ ALGEBRAIC DATA TYPES ]****************************
*******************************************************************************
******************************************************************************/


const type = s => f => f(s); // type constructor


/******************************************************************************
*******************************[ PRODUCT TYPE ]********************************
******************************************************************************/


const struct = type => x => ({
  ["run" + type]: x,
  [TYPE]: type
});


const structn = type => f => f(x => ({
  ["run" + type]: x,
  [TYPE]: type
}));


const structRun = type => f => f(o => {
  o[TYPE] = type;
  return o;
});


/******************************************************************************
********************************[ UNION TYPE ]*********************************
******************************************************************************/


const union = tag => type => x => ({
  ["run" + type]: x,
  tag,
  [TYPE]: type
});


const union0 = tag => type => ({
  tag,
  [TYPE]: type
});


const unionRun = tag => type => f => f(o => {
  o.tag = tag;
  o[TYPE] = type;
  return o;
});


/***[Elimination Rule]********************************************************/


const match = (type, {tag, ["run" + type]: x}, o) =>
  x === undefined
    ? _throw(new UnionError("invalid type"))
    : o[tag] (x);


const match2 = (type,
  {tag: tagx, ["run" + type_]: x},
  {tag: tagy, ["run" + type_]: y}, o) =>
    x === undefined
      || y === undefined
        ? _throw(new UnionError("invalid type"))
        : o[tagx] [tagy] (x) (y);


const match3 = (type,
  {tag: tagx, ["run" + type_]: x},
  {tag: tagy, ["run" + type_]: y},
  {tag: tagz, ["run" + type_]: z}, o) =>
    x === undefined
      || y === undefined
      || z === undefined
        ? _throw(new UnionError("invalid type"))
        : o[tagx] [tagx] [tagz] (x) (y) (z);


/******************************************************************************
*******************************************************************************
********************************[ TRAMPOLINE ]*********************************
*******************************************************************************
******************************************************************************/


const Base = x =>
  ({recur: false, x});


const Recur = (...args) =>
  ({recur: true, args});


const tailRec = f => (...args) => {
    let step = f(...args);

    while (step.recur)
      step = f(...step.args);

    return step.x;
};


// TODO: optimised version


/******************************************************************************
*******************************************************************************
***********************[ AD-HOC POLYMORPHIC FUNCTIONS ]************************
*******************************************************************************
******************************************************************************/


/***[Applicative]*************************************************************/


const apConst = ({map, ap}) => tf => tg =>
  ap(map(_const) (tf)) (tg);


const apConst_ = ({map, ap}) => tf => tg =>
  ap(mapConst(map) (id) (tf)) (tg);


/***[Ix]**********************************************************************/


const range = ({succ, gt}) => (lower, upper) =>
  arrUnfold(x =>
    gt(x) (upper)
      ? None
      : Some([x, succ(x)])) (lower);


const index = ({succ, eq}) => (lower, upper) => x =>
  loop((y = lower, i = 0) =>
    eq(y) (upper) ? None
      : eq(x) (y) ? Some(i)
      : recur(succ(y), i + 1));


const inRange = ({succ, eq, gt}) => (lower, upper) => x =>
  loop((y = lower) =>
    gt(y) (upper) ? false
      : eq(x) (y) ? true
      : recur(succ(y)));


const rangeSize = ({succ, eq, gt}) => (lower, upper) =>
  loop((x = lower, n = 0) =>
    gt(x) (upper)
      ? n
      : recur(succ(x), n + 1));


/***[Foldable]****************************************************************/


const all = ({fold, append, empty}) => p =>
  comp(tx => tx.runAll) (foldMap({fold, append, empty}) (comp(All) (p)));


const any = ({fold, append, empty}) => p =>
  comp(tx => tx.runAny) (foldMap({fold, append, empty}) (comp(Any) (p)));


const foldMap = ({fold, append, empty}) => f =>
  fold(comp2nd(append) (f)) (empty);


/***[Functor]*****************************************************************/


const mapConst = map => x =>
  map(_ => x);


/***[Monad]*******************************************************************/


const kleisli = chain => fm => gm => x =>
  chain(fm) (gm(x));


const kleisli_ = chain => gm => fm => x =>
  chain(fm) (gm(x));


const monadAp = chain => mf => mg =>
  chain(_ => mg) (mf);


/***[Monoid]******************************************************************/


const concat = ({append, empty}) =>
  arrFold(append) (empty);


/******************************************************************************
*******************************************************************************
******************************[ BUILT-IN TYPES ]*******************************
*******************************************************************************
******************************************************************************/


/***[Eq]**********************************************************************/


const eq = x => y => x === y;


const neq = x => y => x !== y;


/***[Ord]*********************************************************************/


const ascOrder = x => y => z =>
  x <= y && y <= z;


const ascOrder_ = (x, y, z) =>
  x <= y && y <= z;


const compare = x => y =>
  x < y ? LT
    : x === y ? EQ
    : GT;
      

const descOrder = x => y => z =>
  x >= y && y >= z;


const descOrder_ = (x, y, z) =>
  x >= y && y >= z;


const gt = x => y => x > y;


const gte = x => y => x >= y;


const lt = x => y => x < y;


const lte = x => y => x <= y;


const min = x => y =>
  x < y ? x
    : x === y ? x
    : y;


const max = x => y =>
  x < y ? y
    : x === y ? x
    : x;


/***[Misc. Combinators]*******************************************************/


const and = x => y =>
  x && y;


const imply = x => y =>
  !x || y;


const not = x => !x;


const or = x => y =>
  x || y;


/******************************************************************************
***********************************[ ARRAY ]***********************************
******************************************************************************/


/***[Alternative]*************************************************************/


// arrAlt @derived


// arrAltx @derived


// arrZero @derived


/***[Applicative]*************************************************************/


const arrAp = tf => tx =>
  arrFold(acc => f =>
    arrAppendx(acc)
      (arrMap(x => f(x)) (tx)))
        ([])
          (tf);


// arrApConstl @derived


const arrApConstr = tf => tx =>
  arrAp(arrMapConst(id) (tf)) (tx);


const arrLiftA2 = f => tx => ty =>
  arrAp(arrMap(f) (tx)) (ty);


const arrOf = x => [x];


/***[ChainRec]****************************************************************/


const arrChainRec = f => {
  const stack = [],
    acc = [];

  let step = f();

  if (step && step.type === recur)
    arrAppendx(stack) (step.arg);

  else
    arrAppendx(acc) (step.arg);

  while (stack.length > 0) {
    step = f(stack.shift());

    if (step && step.type === recur)
      arrAppendx(stack) (step.arg);

    else
      arrAppendx(acc) (step);
  }

  return acc;
};


/***[Clonable]****************************************************************/


const arrClone = xs => {
  const ys = [];

  for (let i = 0; i < xs.length; i++)
    ys[i] = xs[i];

  return ys;
};


/***[Filterable]**************************************************************/


const arrFilter = p => xs =>
  xs.filter((x, i) => p(x, i) ? x : null);


/***[Foldable]****************************************************************/


// arrAll @derived


// arrAny @derived


const arrFold = alg => zero => xs => {
  let acc = zero;

  for (let i = 0; i < xs.length; i++)
    acc = alg(acc) (xs[i], i);

  return acc;
};


const arrFoldM = ({append, empty}) =>
  arrFold(append) (empty);


const arrFoldr = f => acc => xs =>
  loop_((i = 0, k = id) => 
      i === xs.length
        ? call_(k, [acc])
        : recur_([i + 1, acc_ => call_(k, [f(xs[i]) (acc_)])]));


const arrFoldStr = s => ss =>
  ss.join(s);


const arrFoldk = alg => zero => xs =>
  loop((acc = zero, i = 0) =>
    i === xs.length
      ? acc
      : alg(acc) (xs[i], i).runCont(acc_ => recur(acc_, i + 1)));


const arrHisto = alg => zero =>
  comp(headH) (history(alg) (zero));


const arrHylo = alg => zero => coalg =>
  comp(arrFold(alg) (zero)) (arrAna(coalg));


const arrLength = xs => xs.length;


const arrMutu = alg1 => alg2 => zero1 => zero2 =>
  comp(snd)
    (arrFold(([acc1, acc2]) => x =>
      [alg1(acc1) (acc2) (x), alg2(acc1) (acc2) (x)])
        ([zero1, zero2]));


const arrNull = xs => xs.length === 0;


const arrPara = alg => zero => xs => {
  const ys = arrClone(xs);
  
  let acc = zero,
    len = 0,
    x;

  while (x = ys.shift()) 
    acc = alg(acc) (ys) (x, len++);

  return acc;
};


const arrParak = alg => zero => xs => {
  const ys = arrClone(xs);

  return loop((acc = zero, i = 0) =>
    i === xs.length
      ? acc
      : alg(acc) (ys) (ys.shift(), i).runCont(acc_ => recur(acc_, i + 1)));
};


// arrSum @derived


const arrZygo = alg1 => alg2 => zero1 => zero2 =>
  comp(snd)
    (arrFold(([acc1, acc2]) => x =>
      [alg1(acc1) (x), alg2(acc1) (acc2) (x)])
        ([zero1, zero2]));


/***[Functor]*****************************************************************/


const arrMap = f => xs =>
  xs.map((x, i) => f(x, i));


const arrMapConst = x => xs =>
  xs.map(_const(x));


const arrMapx = f => xs =>
  loop(i =>
    i === xs.length
      ? xs
      : recur(arrSetx(f(xs[i]))));


/***[Monad]*******************************************************************/


const arrChain = fm =>
  arrFold(acc => x => arrAppendx(acc) (fm(x))) ([]);


const arrChain2 = fm => mx => my =>
  arrFold(acc => x =>
    arrFold(acc_ => y =>
      arrAppendx(acc_) (fm(x) (y))) (acc) (my)) ([]) (mx);


const arrJoin = xss => {
  let xs = [];

  for (let i = 0; i < xss.length; i++)
    for (let j = 0; j < xss[i].length; j++)
      xs.push(xss[i] [j]);

  return xs;
};


const arrLiftM2 = f => mx => my =>
  arrFold(acc => x =>
    arrFold(acc_ => y =>
      arrConsx(f(x) (y)) (acc_)) (acc) (my)) ([]) (mx);


/***[Monoid]******************************************************************/


const arrEmpty = [];


/***[Semigroup]***************************************************************/


const arrAppend = xs => ys => { // NOTE: expects arrays in both arguments
  if (!ys || ys.length === undefined)
    throw new SemigroupError(`array expected but "${ys}" given`);

  else
    return xs.concat(ys);
};


const arrAppendx = xs => ys => { // NOTE: expects arrays in both arguments
  if (!ys || ys.length === undefined)
    throw new SemigroupError(`array expected but "${ys}" given`);

  else {
    for (let i = 0; i < ys.length; i++)
      xs.push(ys[i]);
  }

  return xs;
};


const arrConcat =
  concat({append: arrAppend, empty: arrEmpty});


// arrPrepend @derived


// arrPrependx @derived


/***[Transduce]***************************************************************/


const arrTransduce = alg => reduce =>
  arrFold(alg(reduce));


const arrTransducek = alg => reduce =>
  arrFoldk(alg(reduce));


/***[Traversable]*************************************************************/


const arrMapA = ({liftA2, of}) => f =>
  arrFold(acc => x => liftA2(arrConsx) (f(x)) (acc)) (of([]));


const arrSeqA = dict =>
  arrMapA(dict) (id);


/***[Unfoldable]**************************************************************/


const arrUnfold = coalg => x => {
  const acc = [];

  while (true) {
    let tx = coalg(x);

    switch (tx.tag) {
      case "None": return acc;
      
      case "Some": {
        acc.push(tx.runOption[0]);
        x = tx.runOption[1];
        break;
      }

      default: throw new UnionError("invalid tag");
    }
  }
};


const arrApo = coalg => x => {
  const acc = [];

  while (true) {
    let tx = coalg(x);

    switch (tx.tag) {
      case "None": return acc;
      
      case "Some": {
        switch (tx.runOption[1].tag) {
          case "Left": {
            arrAppendx(acc)
              ((tx.runOption[1].runEither.unshift(tx.runOption[0]),
                tx.runOption[1].runEither));
            
            return acc;
          }

          case "Right": {
            acc.push(tx.runOption[0]);
            x = tx.runOption[1].runEither;
            break;
          }

          default: throw new UnionError("invalid tag");
        }
        
        break;
      }

      default: throw new UnionError("invalid tag");
    }
  }
};


const arrFutu = coalg => x => {
  const acc = [];

  while (true) {
    let optX = coalg(x);

    switch (optX.tag) {
      case "None": return acc;

      case "Some": {
        let [y, [ys, optX_]] = optX.runOption;

        switch(optX_.tag) {
          case "None": {
            arrAppendx(acc) ((ys.unshift(y), ys));
            return acc;
          }

          case "Some": {
            arrAppendx(acc) ((ys.unshift(y), ys)); 
            x = optX_.runOption;
            break;
          }

          default: throw new UnionError("invalid tag");
        }

        break;
      }

      default: throw new UnionError("invalid tag");
    }
  }
};


/***[Misc. Combinators]*******************************************************/


const arrConsHead = x => xs => {
  const ys = arrClone(xs);
  ys.unshift(x);
  return ys;
};


const arrConsHeadx = x => xs =>
  (xs.unshift(x), xs);


const arrCons = x => xs => {
  const ys = arrClone(xs);
  ys.push(x);
  return ys;
};


const arrConsx = x => xs =>
  (xs.push(x), xs);


const arrConsNth = (i, x) => xs => {
  const ys = arrClone(xs);
  return (ys.splice(i + 1, 0, x), ys);
};


const arrConsNthx = (i, x) => xs =>
  (xs.splice(i + 1, 0, x), xs);


const arrCreateMatrix = (i, j, x) => xs =>
  Array.isArray(xs[i])
    ? (xs[i] [j] = x, xs)
    : (xs[i] = [], xs[i] [j] = x, xs);


const arrDedupe = xs => {
  const s = new Set();

  return arrFilter(x => {
    return s.has(x)
      ? null
      : (s.add(x), x);
  }) (xs);
};


const arrDedupeBy = f => xs => {
  const s = new Set();

  return arrFilter(x => {
    const r = f(x);
    
    return s.has(r)
      ? null
      : (s.add(r), x);
  }) (xs);
};


const arrDedupeOn = k => xs => {
  const s = new Set();

  return arrFilter(o =>
    s.has(o[k])
      ? null
      : (s.add(o[k]), o[k])) (xs);
};


const arrDel = i => xs => {
  const ys = arrClone(xs);
  return (ys.splice(i, 1), ys);
};


const arrDelx = i => xs =>
  (xs.splice(i, 1), xs);


const arrHead = xs =>
  xs.length === 0
    ? None
    : Some(xs[0]);


const arrHeadOr = def => xs =>
  xs.length === 0
    ? def
    : xs[0];


const arrInit = xs =>
  xs.slice(0, -1);


const arrInvert =
  arrFold(
    acc => (x, i) =>
      acc.set(x, i))
        (new Map());


const arrLast = xs =>
  xs.length === 0
    ? None
    : Some(xs[xs.length - 1]);


const arrLastOr = def => xs =>
  xs.length === 0
    ? def
    : xs[xs.length - 1];


const arrMapAdjacent = f => n => xs =>
  loop((i = 0, acc = []) =>
    i + n > xs.length
      ? acc
      : recur(i + 1, (acc.push(f(xs.slice(i, i + n))), acc)));


const arrMapChunk = f => n => xs =>
  loop((i = 0, remainder = xs.length % n, acc = []) =>
    i >= xs.length - remainder
      ? acc
      : recur(i + n, remainder, (acc.push(f(xs.slice(i, i + n))), acc)));


const arrModOr = def => (i, f) => xs =>
  arrModOrx(def) (i, f) (arrClone(xs));


const arrModOrx = def => (i, f) => xs =>
  i in xs
    ? (xs[i] = f(xs[i]), xs)
    : xs[i] = def;


const arrPartition = f => xs => // TODO: use fold
  xs.reduce((m, x) =>
    _let((r = f(x), ys = m.get(r) || []) =>
      m.set(r, (ys.push(x), ys))), new Map());


const arrScan = f => x_ => xs => // TODO: use fold
  loop((acc = [], x = x_, i = 0) =>
    i === xs.length
      ? acc
      : recur(
        (acc.push(f(x) (xs[i])), acc),
        acc[acc.length - 1], i + 1));


const arrSet = (i, x) => xs =>
  arrSetx(i, x) (arrClone(xs));


const arrSetx = (i, x) => xs =>
  (xs[i] = x, xs);


const arrSliceAt = (i, len) => xs =>
  xs.slice(i, i + len);


const arrSliceAtx = (i, len) => xs => {
  if (len === undefined)
    if (i < 0)
      return xs.splice(i);

    else
      return (xs.splice(i), xs);

  else if (len < 0)
    return (xs.splice(xs.length + len), xs);

  else if (len === 0)
    return [];
           
  else
    return xs.splice(i, len);
};


const arrSortBy = f => xs =>
  arrClone(xs).sort((x, y) => f(x) (y));


const arrSortByx = f => xs =>
  xs.sort((x, y) => f(x) (y));


const arrSplitAt = i => xs => {
  const ys = arrClone(xs);
  return [ys, ys.splice(i + 1)];
};


const arrSplitAtx = i => xs =>
  [xs, xs.splice(i + 1)];


const arrSplitBy = p => xs => // aka span
  arrFoldk(
    acc => (x, i) =>
      Cont(k =>
        p(x)
          ? arrSplitAt(i) (xs)
          : k(acc)))
              ([xs, []])
                (xs);


const arrSplitByx = p => xs =>
  arrFoldk(
    acc => (x, i) =>
      Cont(k =>
        p(x)
          ? arrSplitAtx(i) (xs)
          : k(acc)))
              ([xs, []])
                (xs);


const arrTail = xs =>
  xs.slice(1);


const arrTranspose = matrix =>
  matrix[0].map((_, i) =>
    matrix.map(xs => xs[i]));


const arrUnconsHead = xs => {
  const ys = arrClone(xs);

  if (xs.length === 0)
    return None;

  else
    return Some([ys.shift(), ys]);
};


const arrUnconsHeadx = xs => {
  if (xs.length === 0)
    return None;

  else
    return Some([xs.shift(), xs]);
};


const arrUnconsHeadOr = def => xs => {
  const ys = arrClone(xs);

  if (xs.length === 0)
    return [def, ys];

  else
    return [ys.shift(), ys];
};


const arrUnconsHeadOrx = def => xs => {
  if (xs.length === 0)
    return [def, xs];

  else
    return [xs.shift(), xs];
};


const arrUnconsInit = n => xs => {
  if (xs.length < n)
    return [[], xs];

  else {
    const ys = arrClone(xs),
      zs = ys.splice(n + 1);

    return (ys.push(zs), ys);
  }
};


const arrUnconsInitx = n => xs => {
  if (xs.length < n)
    return [[], xs];

  else {
    const ys = xs.splice(n + 1);
    return (xs.push(ys), xs);
  }
};


const arrUnconsLast = xs => {
  const ys = arrClone(xs);

  if (xs.length === 0)
    return None;

  else
    return Some([ys.pop(), ys]);
};


const arrUnconsLastx = xs => {
  if (xs.length === 0)
    return None;

  else
    return Some([xs.pop(), xs]);
};


const arrUnconsLastOr = def => xs => {
  const ys = arrClone(xs);

  if (xs.length === 0)
    return [def, ys];

  else
    return [ys.pop(), ys];
};


const arrUnconsLastOrx = def => xs => {
  if (xs.length === 0)
    return [def, xs];

  else
    return [xs.pop(), xs];
};


const arrUnconsNth = i => xs => {
  const ys = arrClone(xs);

  if (xs.length < i)
    return None;

  else
    return Some([ys.splice(i, 1), ys]);
};


const arrUnconsNthx = i => xs => {
  if (xs.length < i)
    return None;

  else
    return Some([xs.splice(i, 1), xs]);
};


const arrUnconsNthOr = def => i => xs => {
  const ys = arrClone(xs);
  return [xs.length < i ? def : ys.splice(i, 1), ys];
};


const arrUnconsNthOrx = def => i => xs =>
  [xs.length < i ? def : xs.splice(i, 1), xs];


const arrUnconsTail = n => xs => {
  if (xs.length < n)
    return [[], xs];

  else {
    const ys = arrClone(xs),
      zs = ys.splice(n + 1);

    return (zs.push(ys), zs);
  }
};


const arrUnconsTailx = n => xs => {
  if (xs.length < n)
    return [[], xs];

  else {
    const ys = xs.splice(n + 1);
    return (ys.push(xs), ys);
  }
};


const arrUnzip = xss => // TODO: use fold
  loop((acc = [[], []], i = 0) =>
    i === xss.length
      ? acc
      : recur((
          acc[0].push(xss[i] [0]),
          acc[1].push(xss[i] [1]),
          acc), i + 1));


const arrZip = xs => ys => // TODO: use fold
  loop((acc = [], i = 0) => {
    const x = xs[i], y = ys[i];

    if (x === undefined || y === undefined)
      return acc;

    else
      return recur(
        (acc.push([xs[i], ys[i]]), acc), i + 1);
  });


const arrZipBy = f => xs => ys => // TODO: use fold
  loop((acc = [], i = 0) => {
    const x = xs[i], y = ys[i];

    if (x === undefined || y === undefined)
      return acc;

    else
      return recur(
        (acc.push(f(xs[i]) (ys[i])), acc), i + 1);
  });


/***[Derived]*****************************************************************/


const arrAlt = arrAppend;


const arrAltx = arrAppendx;


const arrZero = arrEmpty;


/******************************************************************************
**********************************[ BOOLEAN ]**********************************
******************************************************************************/


const andp = p => q => x =>
  p(x) && q(x);


const isFalse = x => x === false;


const isTrue = x => x === true;


const notp = p => x => !p(x);


const orp = p => q => x =>
  p(x) || q(x);


/******************************************************************************
***********************************[ DATE ]************************************
******************************************************************************/


const dateParse = s => {
  const d = new Date(s);
  
  if (d.getTime === undefined || Number.isNaN(d.getTime()))
    return Left(`malformed date string "${s}"`);

  else
    return Right(d);
};


const formatDate = sep => (...fs) => date =>
  fs.map(f => f(date))
    .join(sep);


const formatDay = digits => n => {
  switch (digits) {
    case 1: return n.toString();
    case 2: return strPadl(2) ("0") (n);

    default: throw new DateError("invalid number of digits");
  }
};


const formatMonth = (monthMap, abbrMonthMap) => digits => n => {
  switch (digits) {
    case 1: return (n + 1).toString();
    case 2: return strPadl(2) ("0") (n + 1);
    case 3: return abbrMonthMap[n];
    case 4: return monthMap[n];
    
    default: throw new DateError("invalid number of digits");
  }
};


const formatYear = digits => n => {
  switch (digits) {
    case 2: return n.toString().slice(digits);
    case 4: return n.toString();

    default: throw new DateError("invalid number of digits");
  }
};


// getDay @derived


const getMonthDays = y => m =>
  new Date(new Date(y, m + 1, 1) - 1).getDate();


// getMonth @derived


const getTimezoneOffset = () => 
  new Date().getTimezoneOffset() * 60 * 1000;


// getYear @derived


const isDate = x =>
  introspect(x) === "Date"
    && !Number.isNaN(x.getTime());


const isDateStr = s => {
  const [y, m, d] = s.split("-");

  if (String(Number(y)) !== y
    || Number(y) < 0)
      return false;

  else if (Number(m) < 1
    || Number(m) > 12)
      return false;

  else if (Number(d) < 1
    || Number(d) > getMonthDays(y) (Number(m)))
      return false;

  else
    return true; 
};


/******************************************************************************
***********************************[ FLOAT ]***********************************
******************************************************************************/


// ceil @derived


// floor @derived


const formatFloat = thdSep => decSep => decDigits => n => {
  const [s, dec] = round(decDigits) (n)
    .toString().concat(".00").split("."),
      hnd = s.slice(-3),
      thd = hnd.length < s
        ? s.slice(0, s.length - hnd.length)
        : "";

  let r = "";

  if (thd)
    r += thd + thdSep;

  return r + hnd + decSep + strPadr(decDigits) ("0") (dec);
};


const isFloatStr = s =>
  s.search(new RegExp("^\\d+\\.\\d+$")) !== NOT_FOUND;


// round @derived


const roundBy = k => digits => fp => {
  let [n, ex] = `${fp < 0 ? Math.abs(fp) : fp}e`.split('e'),
    r = Math[k](`${n}e${Number(ex) + digits}`);

  [n, ex] = `${r}e`.split('e');
  r = Number(`${n}e${Number(ex) - digits}`);

  return fp < 0 ? -r : r;
};


const toFixedFloat = places => fp =>
  String(round(places) (fp));


/***[Derived]*****************************************************************/


const ceil = roundBy("ceil");


const floor = roundBy("floor");


const round = roundBy("round");


/******************************************************************************
*********************************[ FUNCTION ]**********************************
******************************************************************************/


/***[Applicative]*************************************************************/


const funAp = tf => tg => x =>
  tf(x) (tg(x));


const funLiftA2 = f => tg => th => x =>
  f(tg(x)) (th(x));


// funOf @derived


/***[Composition]*************************************************************/


const comp = f => g => x =>
  f(g(x));


const comp2nd = f => g => x => y =>
  f(x) (g(y));


const compBin = f => g => x => y =>
  f(g(x) (y));


const compOn = f => g => x => y =>
  f(g(x)) (g(y));


const pipe = g => f => x =>
  f(g(x));


const pipe_ = g => f => x => y =>
  f(x) (g(y));


const pipeBin = g => f => x => y =>
  f(g(x) (y));


const pipeOn = g => f => x => y =>
  f(g(x)) (g(y));


/***[Contravariant Functor]***************************************************/


const funContra = pipe;


/***[Currying/Partial Application]********************************************/


const curry = f => x => y =>
  f(x, y);


const curry3 = f => x => y => z =>
  f(x, y, z);


const curry4 = f => w => x => y => z =>
  f(w, x, y, z);


const curry5 = f => v => w => x => y => z =>
  f(v, w, x, y, z);


const curry6 = f => u => v => w => x => y => z =>
  f(u, v, w, x, y, z);


const partial = (f, ...args) => (...args_) =>
  f(...args, ...args_);


const uncurry = f => (x, y) =>
  f(x) (y);


const uncurry3 = f => (x, y, z) =>
  f(x) (y) (z);


const uncurry4 = f => (w, x, y, z) =>
  f(w) (x) (y) (z);


const uncurry5 = f => (v, w, x, y, z) =>
  f(v) (w) (x) (y) (z);


const uncurry6 = f => (u, v, w, x, y, z) =>
  f(u) (v) (w) (x) (y) (z);


/***[Debugging]***************************************************************/


const debug = f => (...args) => {
  debugger;
  return f(...args);
};


const delay = f => ms => x =>
  Task((res, rej) => setTimeout(comp(res) (f), ms, x));


const log = s =>
  (console.log(s), s);


const taggedLog = tag => s =>
  (console.log(tag, s), s);


const trace = f =>
  eff(x => console.log(JSON.stringify(x) || x.toString()));


/***[Functor]*****************************************************************/


const funMap = comp;


/***[Impure]******************************************************************/


const eff = f => x =>
  (f(x), x); // aka tap


const introspect = x =>
  x && x[TYPE] !== undefined
    ? x[TYPE]
    : Object.prototype.toString.call(x).slice(8, -1);


const isUnit = x =>
  x === undefined
    || x === null
    || x === x === false // NaN
    || x.getTime !== undefined && Number.isNaN(x.getTime()); // Invalid Date


const _throw = e => {
  throw e;
};


const tryCatch = f => g => x => {
  try {
    return f(x);
  }

  catch(e) {
    return g([x, e]);
  }
};


/***[Monad]*******************************************************************/


const funChain = fm => mg => x =>
  fm(mg(x)) (x);


const funChain_ = mg => fm => x =>
  fm(mg(x)) (x);


const funJoin = mmf => x =>
  mmf(x) (x);


/***[Monoid]******************************************************************/


// funEmpty @derived


/***[Primitive]***************************************************************/


const app = f => x => f(x);


const app_ = x => f => f(x);


const _const = x => _ => x;


const const_ = _ => y => y;


const fix = f => x => f(fix(f)) (x); // not stack safe


const flip = f => y => x => f(x) (y);


const id = x => x;


/***[Profunctor]**************************************************************/


const funDimap = f => g => h => x =>
  g(h(f(x)));


const funLmap = f => h => x =>
  h(f(x));


const funRmap = g => h => x =>
  g(h(x));


/***[Semigroup]***************************************************************/


const funAppend = comp;


const funPrepend = pipe;


/***[Infix Combinators]*******************************************************/


const infix = (x, f, y) =>
  f(x) (y);


const infix2 = (x, f, y, g, z) =>
  g(f(x) (y)) (z);


const infix3 = (w, f, x, g, y, h, z) =>
  h(g(f(w) (x)) (y)) (z);


const infix4 = (v, f, w, g, x, h, y, i, z) =>
  i(h(g(f(v) (w)) (x)) (y)) (z);


const infix5 = (u, f, v, g, w, h, x, i, y, j, z) =>
  j(i(h(g(f(u) (v)) (w)) (x)) (y)) (z);


const infix6 = (t, f, u, g, v, h, w, i, x, j, y, k, z) =>
  k(j(i(h(g(f(t) (u)) (v)) (w)) (x)) (y)) (z);


const infixM2 = (λ, f, x, g, y) =>
  f(x_ =>
    λ(x_, α => g(y_ =>
      α(y_, id) (y))) (x);


const infixM3 = (λ, f, x, g, y, h, z) =>
  f(x_ =>
    λ(x_, α => g(y_ =>
      α(y_, β => h(z_ =>
        β(z_, id)) (z))) (y))) (x);


const infixM4 = (λ, f, w, g, x, h, y, i, z) =>
  f(w_ =>
    λ(w_, α => g(x_ =>
      α(x_, β => h(y_ =>
        β(y_, γ => i(z_ =>
          γ(z_, id)) (z))) (y))) (x))) (w);



const infixM5 = (λ, f, v, g, w, h, x, i, y, j, z) =>
  f(v_ =>
    λ(v_, α => g(w_ =>
      α(w_, β => h(x_ =>
        β(x_, γ => i(y_ =>
          γ(y_, δ => j(z_ =>
            δ(z_, id)) (z))) (y))) (x))) (w))) (v);



const infixM6 = (λ, f, u, g, v, h, w, i, x, j, y, k, z) =>
  f(u_ =>
    λ(u_, α => g(v_ =>
      α(v_, β => h(w_ =>
        β(w_, γ => i(x_ =>
          γ(x_, δ => j(y_ =>
            δ(y_, ε => k(z_ =>
              ε(z_, id)) (z))) (y))) (x))) (w))) (v))) (u);


const infixr = (y, f, x) =>
  f(x) (y);


const infixr2 = (x, f, y, g, z) =>
  f(x) (g(y) (z));


const infixr3 = (w, f, x, g, y, h, z) =>
  f(w) (g(x) (h(y) (z)));


const infixr4 = (v, f, w, g, x, h, y, i, z) =>
  f(v) (g(w) (h(x) (i(y) (z))));


const infixr5 = (u, f, v, g, w, h, x, i, y, j, z) =>
  f(u) (g(v) (h(w) (i(x) (j(y) (z)))));


const infixr6 = (t, f, u, g, v, h, w, i, x, j, y, k, z) =>
  f(t) (g(u) (h(v) (i(w) (j(x) (k(y) (z))))));


const infixrM2 = (x, f, y, g, λ) =>
  f(x) (x_ =>
    λ(x_, α => g(y) (y_ =>
      α(y_, id))));


const infixrM3 = (x, f, y, g, z, h, λ) =>
  f(x) (x_ =>
    λ(x_, α => g(y) (y_ =>
      α(y_, β => h(z) (z_ =>
        β(z_, id))))));


const infixrM4 = (w, f, x, g, y, h, z, i, λ) =>
  f(w) (w_ =>
    λ(w_, α => g(x) (x_ =>
      α(x_, β => h(y) (y_ =>
        β(y_, γ => i(z) (z_ =>
          γ(z_, id))))))));


const infixrM5 = (v, f, w, g, x, h, y, i, z, j, λ) =>
  f(v) (v_ =>
    λ(v_, α => g(w) (w_ =>
      α(w_, β => h(x) (x_ =>
        β(x_, γ => i(y) (y_ =>
          γ(y_, δ => j(z) (z_ =>
            δ(z_, id))))))))));


const infixrM6 = (u, f, v, g, w, h, x, i, y, j, z, k, λ) =>
  f(u) (u_ =>
    λ(u_, α => g(v) (v_ =>
      α(w_, β => h(w) (w_ =>
        β(x_, γ => i(x) (x_ =>
          γ(y_, δ => j(y) (y_ =>
            δ(y_, ε => k(z) (z_ =>
              ε(z_, id))))))))))));


/***[Misc. Combinators]*******************************************************/


const appr = (f, y) => x => f(x) (y); // right section


const apply = f =>
  arrFold(g => x => g(x)) (f);


const apply_ = f => args => 
  f(...args);


const guard = p => f => x =>
  p(x) ? f(x) : x;


const _let = f => f();


const select = p => f => g => x =>
  p(x) ? f(x) : g(x);


const select11 = m => (ks, vs) => k =>
  vs[m.get(ks.indexOf(k))];


const select1N = m => (ks, vs) => k =>
  arrMap(l => vs[l])
    (m.get(ks.indexOf(k)));


/***[Derived]*****************************************************************/


const funEmpty = id;


const funOf = _const;


/******************************************************************************
*********************************[ GENERATOR ]*********************************
******************************************************************************/


const _enum = function* (n) {
  while (true)
    yield n++;
};


/******************************************************************************
************************************[ MAP ]************************************
******************************************************************************/


const _Map = xss =>
  new Map(xss);


/***[Functor]*****************************************************************/


const mapMap = f => m => {
  let n = new Map();
  
  for (const [k, v] of m)
    n.set(k, f(v));
  
  return n;
};


/***[Misc. Combinators]*******************************************************/


const mapDel = k => m =>
  new Map(m).delete(k);


const mapDelx = k => m =>
  m.delete(k);


const mapGet = k => m =>
  m.has(k)
    ? Some(m.get(k))
    : None;


const mapGetOr = def => k => m =>
  m.has(k)
    ? m.get(k)
    : def;


const mapModOr = def => (k, f) => m =>
  m.has(k)
    ? new Map(m).set(k, f(m.get(k)))
    : new Map(m).set(k, def);


const mapModOrx = def => (k, f) => m =>
  m.has(k)
    ? m.set(k, f(m.get(k)))
    : m.set(k, def);


const mapSet = (k, v) => m =>
  new Map(m).set(k, v);


const mapSetx = (k, v) => m =>
  m.set(k, v);


/******************************************************************************
**********************************[ NUMBER ]***********************************
******************************************************************************/


/***[Bounded]*****************************************************************/


const numMaxBound = Number.MAX_SAFE_INTEGER;


const numMinBound = Number.MIN_SAFE_INTEGER;


/***[Enum]********************************************************************/


const numFromEnum = id;


const numPred = n => n === numMinBound
  ? _throw(new EnumError("enumeration out of bound"))
  : n - 1;


const numSucc = n => n === numMaxBound
  ? _throw(new EnumError("enumeration out of bound"))
  : n + 1;


const numToEnum = id;


/***[Eq]**********************************************************************/


const numEq = eq;


const numNeq = neq;


/***[Ord]**********************************************************************/


const numCompare = compare;


const numGt = gt;


const numGte = gte;


const numLt = lt;


const numLte = lte;


const numMin = min;


const numMax = max;


/***[Misc. Combinators]*******************************************************/


const isIntStr = s =>
  s.search(new RegExp("^\\d+$")) !== NOT_FOUND;


/******************************************************************************
**********************************[ OBJECT ]***********************************
******************************************************************************/


const invoke = k => (...args) => o =>
  o[k] (...args);


const _new = cons => (...args) =>
  new cons(...args);


const objClone = o => {
  const p = {};

  for (k of objKeys(o))
    Object.defineProperty( // getter/setter safe
      p, k, Object.getOwnPropertyDescriptor(o, k));

  return p;
};


const objDel = k => o =>
  objDelx(k) (objClone(o));


const objDelx = k => o =>
  (delete o[k], o);


const objGetOr = def => k => o =>
  k in o ? o[k] : def;


const objMemo = k => f => o => Object.defineProperty(o, k, {get: function() {
  return x => {
    const r = f(x);
    delete this[k];
    this[k] = () => r;
    return r;
  };
}, configurable: true});


const objModOr = def => (k, f) => o =>
  objModOrx(def) (k, f) (objClone(o));


const objModOrx = def => (k, f) => o =>
  k in o
    ? (o[k] = f(o[k]), o)
    : (o[k] = def, o);


const objSet = (k, v) => o =>
  objSetx(k, v) (objClone(o));


const objSetx = (k, v) => o =>
  (o[k] = v, o);


const objUnion = o => p =>
  objUnionx(objClone(o)) (p);


const objUnionx = o => p => {
  for ([k, v] of objEntries(p))
    o[k] = v;

  return o;
};


const thisify = f => f({}); // mimics this context


/***[Generators]**************************************************************/


function* objEntries(o) {
  for (let prop in o) {
    yield [prop, o[prop]];
  }
}


function* objKeys(o) {
  for (let prop in o) {
    yield prop;
  }
}


function* objValues(o) {
  for (let prop in o) {
    yield o[prop];
  }
}


/******************************************************************************
************************************[ SET ]************************************
******************************************************************************/


const _Set = xs =>
  new Set(xs);


/***[Functor]*****************************************************************/


const setMap = f => s => {
  const t = new Set();
  
  for (const x of s)
    t.add(f(x));
  
  return t;
};


/******************************************************************************
**********************************[ STRING ]***********************************
******************************************************************************/


/***[Foldable]****************************************************************/


const strFold = alg => zero => s => {
  let acc = zero;

  for (let i = 0; i < s.length; i++)
    acc = alg(acc) (s[i], i);

  return acc;
};


const strFoldChunks = alg => zero => s => {
  let acc = zero;

  for (let i = 0; i < s.length; i++)
    [acc, i] = alg(acc) (s, i);

  return acc;
};


const strLength = s => s.length;


const strNull = s => s === "";


/***[Semigroup]***************************************************************/


const strAppend = s => t => s + t;


const strPrepend = t => s => s + t;


/***[Regular Expressions]*****************************************************/


const strDel = (r, flags) => s =>
  s.replace(new RegExp(r, flags), "");


const strMatch = (r, flags) => s => {
  const xs = s.match(new RegExp(r, flags));

  if (xs === null)
    return Matched(None);

  else if (!("index" in xs))
    throw new RegExpError(`invalid greedy regular expression`);

  else if (xs.groups === undefined)
    xs.groups = {}; // add empty group instead of undefined

  xs.relIndex = xs.index; // add relative index in case of multiple matches
  xs.relInput = xs.input; // add relative input in case of multiple matches
  return Matched(Some(xs));
};


const strMatchAll = (r, flags) => s_ =>
  loop((acc = [], s = s_, i = 0) => {
    if (s === "")
      return acc;

    else {
      const tx = strMatch(r, flags) (s);

      switch (tx.runMatched.tag) {
        case "None": return acc;

        case "Some": {
          const xs = tx.runMatched.runOption;
          xs.index += i;
          xs.input = s_;

          return recur(
            (acc.push(tx), acc),
            s_.slice(xs.index + xs[0].length),
            xs.index + xs[0].length);
        }

        default: _throw(new UnionError("unknown tag"));
      }
    }
  });


const strMatchLast = (r, flags) => s_ =>
  loop((acc = Matched(None), s = s_, i = 0) => {
    if (s === "")
      return acc;

    else {
      const tx = strMatch(r, flags) (s);

      switch (tx.runMatched.tag) {
        case "None": return acc;

        case "Some": {
          const xs = tx.runMatched.runOption;
          xs.index += i;
          xs.input = s_;

          return recur(
            tx,
            s_.slice(xs.index + xs[0].length),
            xs.index + xs[0].length);
        }

        default: _throw(new UnionError("unknown tag"));
      }
    }
  });


const strMatchNth = nth_ => (r, flags) => s_ =>
  loop((acc = Matched(None), s = s_, i = 0, nth = 0) => {
    if (nth_ === nth)
      return acc;

    else if (s === "")
      return Matched(None);

    else {
      const tx = strMatch(r, flags) (s);

      switch (tx.runMatched.tag) {
        case "None": return acc;

        case "Some": {
          const xs = tx.runMatched.runOption;
          xs.index += i;
          xs.input = s_;

          return recur(
            tx,
            s_.slice(xs.index + xs[0].length),
            xs.index + xs[0].length,
            nth + 1);
        }

        default: _throw(new UnionError("unknown tag"));
      }
    }
  });


const strMod = (r, f, flags) => s =>
  s.replace(new RegExp(r, flags), f);


const strNormalize = pairs => s =>
  arrFold(acc => ([from, to]) =>
    strSet(from, to, "gi") (acc)) (s) (pairs);
      
      
const strNormalizeBy = pairs => s =>
  arrFold(acc => ([from, f]) =>
    strMod(from, f, "gi") (acc)) (s) (pairs);


const strSet = (r, t, flags) => s =>
  s.replace(new RegExp(r, flags), t);


/***[Misc. Combinators]*******************************************************/


const strCapWord = s =>
  s[0].toUpperCase() + s.slice(1);


const strChunk = n =>
  strFoldChunks(
    acc => (s, i) =>
      [arrAppendx(acc) ([s.slice(i, i + n)]), i])
        ([]);


const strConsNth = (t, i) => s =>
  s.slice(0, i + 1) + t + s.slice(i + 1);


const strLocaleCompare = locale => c => d => {
  switch (c.localeCompare(d, locale)) {
    case -1: return LT;
    case 0: return EQ;
    case 1: return GT;
  }
};


const strPadl = n => c => s =>
  c.repeat(n)
    .concat(s)
    .slice(-n);


const strPadr = n => c => s =>
  s.concat(
    c.repeat(n))
      .slice(0, n);


const strSliceAt = (i, len) => s =>
  s.slice(i, i + len);


const strSplitAt = i => s =>
  [s.slice(0, i + 1), s.slice(i + 1)];


const strSplitBy = p =>
  strFoldChunks(
    acc => (s, i) =>
      p(s[i])
        ? [strSplitAt(i) (s), s.length]
        : [acc, i])
            (["", ""]);


const strSplitWords = excl => s => {
  const xs = s.split(
    new RegExp(`[^\\p{L}\\p{N}${excl}]+(?=\\p{L}|$)`, "gu"));

  if (xs[xs.length - 1] === "")
    xs.pop();

  return xs;
};


const strToLower = s =>
  s.toLowerCase();


const strToUpper = s =>
  s.toUpperCase();


const strTrim = s =>
  s.trim();


const strUnconsNth = (i, len) => s =>
  i >= s.length
    ? None
    : Some([s.slice(i, i + len), s.slice(0, i) + s.slice(i + len)]);


const strUnconsNthOr = def => (i, len) => s =>
  i >= s.length
    ? [def, s]
    : [s.slice(i, i + len), s.slice(0, i) + s.slice(i + len)];


const toString = x => x.toString();


/******************************************************************************
**********************************[ DERIVED ]**********************************
******************************************************************************/


const arrApConstl = arrLiftA2(_const);


const arrPrepend = flip(arrAppend);


const arrPrependx = flip(arrAppendx);


const getDay = d => d.getDate();


const getMonth = d => d.getMonth();


const getYear = d => d.getFullYear();


/******************************************************************************
*******************************************************************************
***********************[ FUNCTIONAL PROGRAMMING TYPES ]************************
*******************************************************************************
******************************************************************************/


/******************************************************************************
************************************[ ALL ]************************************
******************************************************************************/


const All = struct("All");


/***[Monoid]******************************************************************/


const allEmpty = All(true);


/***[Semigroup]***************************************************************/


const allAppend = tx => ty =>
  All(tx.runAll && ty.runAll);


const allPrepend = allAppend;


/******************************************************************************
************************************[ ANY ]************************************
******************************************************************************/


const Any = struct("Any");


/***[Monoid]******************************************************************/


const anyEmpty = Any(false);


/***[Semigroup]***************************************************************/


const anyAppend = tx => ty =>
  Any(tx.runAny || ty.runAny);


const anyPrepend = anyAppend;


/******************************************************************************
**********************************[ COMPARE ]**********************************
******************************************************************************/


const Compare = struct("Compare");


/***[Contravariant Functor]***************************************************/


const compContra = f => tf =>
  Compare(compOn(tf.runCompare) (f));


/***[Monoid]******************************************************************/


const compEmpty = Compare(x => y => EQ);


/***[Semigroup]***************************************************************/


const compAppend = tf => tg =>
  Compare(x => y =>
    ordAppend(tf.runCompare(x) (y)) (tg.runCompare(x) (y)));


const compPrepend = flip(compAppend);


/******************************************************************************
**********************************[ COMPOSE ]**********************************
******************************************************************************/


const Comp = struct("Comp");


/***[Applicative]*************************************************************/


const compOf = ({of1, of2}) => x =>
  Comp(of1(of2(x)));


const compAp = ({map1, ap1, ap2}) => ttf => ttx =>
  Comp(ap1(map1(ap2) (ttf.runComp)) (ttx.runComp));


/***[Functor]*****************************************************************/


const compMap = ({map1, map2}) => f => ttx =>
  Comp(map1(map2(f)) (ttx.runComp));


/******************************************************************************
*********************************[ CONSTANT ]**********************************
******************************************************************************/


const Const = struct("Const");


/***[Applicative]*************************************************************/


const constOf = x => Const(x);


/***[Functor]*****************************************************************/


const constMap = f => tx =>
  Const(tx.runConst);


/******************************************************************************
*******************************[ CONTINUATION ]********************************
******************************************************************************/


const Cont = struct("Cont");


const cont = f => x =>
  Cont(k => k(f(x))); 


const cont2 = f => x => y =>
  Cont(k => k(f(x) (y)));


/***[Applicative]*************************************************************/


const contAp = tf => tx =>
  Cont(k => tf.runCont(f => tx.runCont(x => k(f(x)))));


const contLiftA2 = f => tx => ty =>
  contAp(contMap(f) (tx)) (ty);


const contOf = x => Cont(k => k(x));


/***[ChainRec]****************************************************************/


const contChainRec = f =>
  Cont(k => {
    let acc = f();

    while (acc && acc.type === recur) {
      acc.args[0] = acc.args[0] (id);
      acc = f(...acc.args);
    }

    return k(acc);
  });


/***[Functor]*****************************************************************/


const contMap = f => tx =>
  Cont(k => tx.runCont(x => k(f(x))));
                                  

/***[Monad]*******************************************************************/


const contChain = fm => mx =>
  Cont(k => mx.runCont(x => fm(x).runCont(y => k(y))));


const contChain2 = fm => mx => my =>
  Cont(k => mx.runCont(x => my.runCont(y => fm(x) (y).runCont(z => k(z)))));


const contJoin = mmx =>
  Cont(k => mmx.runCont(mx => mx.runCont(x => k(x))));


const contLiftM2 = f => mx => my =>
  Cont(k => mx.runCont(x => my.runCont(y => k(f(x) (y)))));


/***[Misc. Combinators]*******************************************************/


const contReset = tx => // delimited continuations
  contOf(tx.runCont(id));
  

const contShift = f => // delimited continuations
  Cont(k => f(k).runCont(id));


/******************************************************************************
***********************[ DEFER (LAZY EVAL W/O SHARING ]************************
******************************************************************************/


const Defer = structGetter("Defer")
  (Defer => thunk => Defer({get runDefer() {return thunk()}}));


/***[Applicative]*************************************************************/


const defAp = tf => tx =>
  Defer(() => tf.runDefer(tx.runDefer));


const defOf = x => Defer(() => x);


/***[ChainRec]****************************************************************/


const defChainRec = f =>
  Defer(() => {
    let acc = f();

    while(acc && acc.type === recur) {
      acc.args[0] = acc.args[0].runDefer();
      acc = f(...acc.args);
    }

    return acc.runDefer();
  });


/***[Functor]*****************************************************************/


const defMap = f => tx =>
  Defer(() => f(tx.runDefer));


/***[Monad]*******************************************************************/


const defChain = fm => mx =>
  Defer(() => fm(mx.runDefer).runDefer);


const defJoin = mmx =>
  Defer(() => mmx.runDefer.runDefer);


/******************************************************************************
**********************************[ EITHER ]***********************************
******************************************************************************/


const Either = union("Either");


const Left = x =>
  Either("Left", x);


const Right = x =>
  Either("Right", x);


/***[Foldable]****************************************************************/


const ethCata = left => right => tx =>
  match(tx, {
    type: "Either",
    get Left() {return left(tx.runEither)},
    get Right() {return right(tx.runEither)}
  });


/******************************************************************************
*******************************[ ENDOMORPHISM ]********************************
******************************************************************************/


const Endo = struct("Endo");


/***[Monoid]******************************************************************/


const endoEmpty = Endo(id);


/***[Semigroup]***************************************************************/


const endoAppend = tf => tg => x =>
  Endo(tf.runEndo(tg.runEndo(x)));


const endoPrepend = flip(endoAppend);


/******************************************************************************
********************************[ EQUIVALENT ]*********************************
******************************************************************************/


const Equiv = struct("Equiv");


/***[Contravariant Functor]***************************************************/


const equivContra = f => tf =>
  Equiv(compOn(tf.runEquiv) (f));


/***[Monoid]******************************************************************/


const equivEmpty = Equiv(x => y => true);


/***[Semigroup]***************************************************************/


const equivAppend = tf => tg =>
  Equiv(x => y =>
    tf.runEquiv(x) (y) && tg.runEquiv(x) (y));


const equivPrepend = equivAppend;


/******************************************************************************
***********************************[ FIRST ]***********************************
******************************************************************************/


const First = struct("First");


/***[Semigroup]***************************************************************/


const firstAppend = x => _ => x;


// firstPrepend @derived


/******************************************************************************
******************************[ GETTER (OPTICS) ]******************************
******************************************************************************/


const Lens = struct("Lens");


/***[Instances]***************************************************************/


// Object


const objGetter = k =>
  Lens(_ => ft => o =>
    ft(o[k]));


/***[Category]****************************************************************/


const getComp = tx => ty =>
  Lens(x => tx.runLens() (ty.runLens() (x)));


const getComp3 = tx => ty => tz =>
  Lens(x => tx.runLens() (ty.runLens() (tz.runLens() (x))));


const getId = Lens(id);


/***[Misc. Combinators]*******************************************************/


const getGet = tx => o =>
  tx.runLens(Const) (o)
    .runConst;


/******************************************************************************
**********************************[ HISTORY ]**********************************
******************************************************************************/


// part of the histomorpishm

const History = union("History");


const Ancient = x => History("Ancient", x);


const Age = x => y => History("Age", [x, y, z]);


const history = alg => zero =>
  arrFoldr(x => acc => Age(x) (alg(x) (acc)) (acc))
    (Ancient(zero));


const headH = tx => {
  switch (tx.tag) {
    case "Ancient": return tx.runHistory;
    case "Age": return tx.runHistory[1];
    default: throw new UnionError("invalid tag");
  }
};


/******************************************************************************
************************************[ ID ]*************************************
******************************************************************************/


const Id = struct("Id");


/***[Applicative]*************************************************************/


const idOf = x => Id(x);


/***[Functor]*****************************************************************/


const idMap = f => tx =>
  Id(f(tx.runId));


/******************************************************************************
***********************************[ LAST ]************************************
******************************************************************************/


const Last = struct("Last");


/***[Semigroup]***************************************************************/


const lastAppend = _ => y => y;


const lastPrepend = firstAppend;


/******************************************************************************
***********************[ LAZY (LAZY EVAL WITH SHARING) ]***********************
******************************************************************************/


const Lazy = structGetter("Lazy")
  (Lazy => thunk => Lazy({
    get runLazy() {
      delete this.runLazy;
      return this.runLazy = thunk();
    }}));


/***[Applicative]*************************************************************/


const lazyAp = tf => tx =>
  Lazy(() => tf.runLazy (tx.runLazy));


const lazyOf = x => Lazy(() => x);


/***[ChainRec]****************************************************************/


const lazyChainRec = f =>
  Lazy(() => {
    let acc = f();

    while(acc && acc.type === recur) {
      acc.args[0] = acc.args[0].runLazy();
      acc = f(...acc.args);
    }

    return acc.runLazy();
  });


/***[Functor]*****************************************************************/


const lazyMap = f => tx =>
  Lazy(() => f(tx.runLazy));


/***[Monad]*******************************************************************/


const lazyChain = fm => mx =>
  Lazy(() => fm(mx.runLazy).runLazy);


const lazyJoin = mmx =>
  Lazy(() => mmx.runLazy.runLazy);


/******************************************************************************
*******************************[ LENS (OPTICS) ]*******************************
******************************************************************************/


// constructor defined @getter


/***[Instances]***************************************************************/


// Array


const arrLens_ = ({set, del}) => i =>
  Lens(map => ft => xs =>
    map(x => {
      if (x === null)
        return del(i) (xs);

      else
        return set(i, x) (xs);
    }) (ft(xs[i])));


const arrLens = arrLens_({set: arrSet, del: arrDel});


const arrLensx = arrLens_({set: arrSetx, del: arrDelx});


// Map


const mapLens_ = ({set, del}) => k =>
  Lens(map => ft => m =>
    map(v => {
      if (v === null)
        return del(k) (m);

      else 
        return set(k, v) (m)
    }) (ft(m.get(k))));


const mapLens = mapLens_({set: mapSet, del: mapDel});


const mapLensx = mapLens_({set: mapSetx, del: mapDelx});


// Object


const objLens_ = ({set, del}) => k =>
  Lens(map => ft => o =>
    map(v => {
      if (v === null)
        return del(k) (o);

      else 
        return set(k, v) (o)
    }) (ft(o[k])));


const objLens = objLens_({set: objSet, del: objDel});


const objLensx = objLens_({set: objSetx, del: objDelx});


// String


const strLens = (i, len) => // String is immutable hence no typeclass functions
  Lens(map => ft => s =>
    map(t => {
      const tx = strUnconsNth(i, len) (s);

      switch (tx.tag) {
        case "None": return t;

        case "Some":
          return strConsNth(t, i - 1) (tx.runOption[1]);
      }
    })
      (ft(s.slice(i, len + i))));


/***[Category]****************************************************************/


const lensComp = tx => ty =>
  Lens(map => ft =>
    tx.runLens(map) (ty.runLens(map) (ft)));


const lensComp3 = tx => ty => tz =>
  Lens(map => ft =>
    tx.runLens(map) (ty.runLens(map) (tz.runLens(map) (ft))));


const lensId = Lens(id);


/***[Misc. Combinators]*******************************************************/


const lensDel = tx => o =>
  tx.runLens(idMap) (_const(Id(null))) (o);


const lensGet = tx => o =>
  tx.runLens(constMap) (Const) (o)
    .runConst;


const lensMod = tx => f => o =>
  tx.runLens(idMap) (v => Id(f(v))) (o);


const lensSet = tx => v => o =>
  tx.runLens(idMap) (_const(Id(v))) (o);


/******************************************************************************
***********************************[ LOOP ]************************************
******************************************************************************/


const Loop = f => (...args) =>
  ({loop: true, f, args});


const Loop_ = (f, ...args) =>
  ({loop: true, f, args});


const Done = x =>
  ({loop: false, x});


const monadRec = res => {
    while (res.loop)
      res = res.f(...res.args);

    return res.x;
};


const loopOf = Done;


const loopChain = (tf, fm) => tf.loop
  ? Loop_(args => loopChain(tf.f(...args), fm), tf.args)
  : fm(tf.x);


/******************************************************************************
**************************[ MATCHED (REGEXP RESULT) ]**************************
******************************************************************************/


const Matched = struct("Matched");


/***[Foldable]****************************************************************/


const matCata = x => tx =>
  match(tx.runMatched, {
    type: "Option",
    None: x,
    Some: tx.runMatched.runOption
  });


/******************************************************************************
************************************[ MAX ]************************************
******************************************************************************/


const Max = struct("Max");


/***[Monoid]******************************************************************/


const maxEmpty = minBound => Max(minBound);


/***[Semigroup]***************************************************************/


const maxAppend = max => x => y =>
  max(x) (y);


const maxPrepend = maxAppend;


/******************************************************************************
************************************[ MIN ]************************************
******************************************************************************/


const Min = struct("Min");


/***[Monoid]******************************************************************/


const minEmpty = maxBound => Min(maxBound);


/***[Semigroup]***************************************************************/


const minAppend = min => x => y =>
  min(x) (y);


const minPrepend = minAppend;


/******************************************************************************
**********************************[ OPTION ]***********************************
******************************************************************************/


const Option = unionGetter("Option");


const None = Option("None", {get runOption() {return None}});


const Some = x => Option("Some", {runOption: x});


/***[Applicative]*************************************************************/


const optAp = tf => tx =>
  match(tf, {
    type: "Option",
    None: None,
    get Some() {
      return match(tx, {
        type: "Option",
        None: None,
        get Some() {return Some(tf.runOption(tx.runOption))}
      });
    }
  });


const optLiftA2 = f => tx => ty =>
  optAp(optMap(f) (tx)) (ty);


const optOf = x => Some(x);


/***[Folding]*****************************************************************/


const optCata = none => some => tx =>
  match(tx, {
    type: "Option",
    None: none,
    get Some() {return some(tx.runOption)}
  });


/***[Functor]*****************************************************************/


const optMap = f => tx =>
  match(tx, {
    type: "Option",
    None: None,
    get Some() {return Some(f(tx.runOption))}
  });


/***[Monad]*******************************************************************/


const optChain = fm => mx =>
  match(mx, {
    type: "Option",
    None: None,
    get Some() {return fm(mx.runOption)}
  });


const optChainT = ({chain, of}) => fmm => mmx =>
  chain(mx => {
    switch (mx.tag) {
      case "None": return of(None);
      case "Some": return fmm(mx.runOption);
    }
  }) (mmx);


/******************************************************************************
*********************************[ ORDERING ]**********************************
******************************************************************************/


const Ordering = unionGetter("Ordering");


const LT = Ordering("LT",
  {get runOrdering() {return LT}, valueOf: () => -1});


const EQ = Ordering("EQ",
  {get runOrdering() {return EQ}, valueOf: () => 0});


const GT = Ordering("GT",
  {get runOrdering() {return GT}, valueOf: () => 1});


/***[Foldable]****************************************************************/


const ordCata = lt => eq => gt => tx =>
  match(tx, {
    type: "Ordering",
    LT: lt,
    EQ: eq,
    GT: gt
  });


/***[Monoid]******************************************************************/


const ordEmpty = EQ;


/***[Semigroup]***************************************************************/


const ordAppend = tx => ty =>
  ordCata(LT) (ty) (GT) (tx);


const ordPrepend = ordAppend;


/******************************************************************************
***********************[ PARALLEL (ASYNC IN PARALLEL) ]************************
******************************************************************************/


// NOTE: This type is mainly untested and may undergo major changes in the future. 


const Parallel = structGetter("Parallel")
  (Parallel => k => Parallel(thisify(o => {
    o.runParallel = (res, rej) => k(x => {
      o.runParallel = l => l(x);
      return res(x);
    }, rej);
    
    return o;
  })));


/***[Foldable]****************************************************************/


const parCata = alg => tf.runParallel;


/***[Applicative]*************************************************************/


const parAp = tf => tx =>
  Parallel((res, rej) =>
    parAnd(tf) (tx).runParallel(([f, x]) => res(f(x)), rej));


const parOf = x => Parallel((res, rej) => res(x));


/***[Functor]*****************************************************************/


const parMap = f => tx =>
  Parallel((res, rej) => tx.runParallel(x => res(f(x)), rej));


/***[Monoid]******************************************************************/


const parEmpty = Parallel((res, rej) => null);


/***[Semigroup]***************************************************************/


// parAppend @derived


// parPrepend @derived


/***[Misc. Combinators]*******************************************************/


const parAnd = tf => tg => {
  const r = []

  const guard = (res, rej, i) => [
    x => (
      r[i] = x,
      isRes || isRej || r[0] === undefined || r[1] === undefined
        ? false
        : (isRes = true, res(r))),
    e =>
      isRes || isRej
        ? false
        : (isRej = true, rej(e))];

  let isRes = false,
    isRej = false;

  return Parallel(
    (res, rej) => (
      tf.runParallel(...guard(res, rej, 0)),
      tg.runParallel(...guard(res, rej, 1))));
};


const parOr = tf => tg => {
  const guard = (res, rej) => [
    x => (
      isRes || isRej
        ? false
        : (isRes = true, res(x))),
    e =>
        isRes || isRej
          ? false
          : (isRej = true, rej(e))];

  let isRes = false,
    isRej = false;

  return Parallel(
    (res, rej) => (
      tf.runParallel(...guard(res, rej)),
      tg.runParallel(...guard(res, rej))))
};


const parAll = ts => // eta abstraction to create a new tOf([]) for each invocation
  arrFold(acc => tf =>
    parMap(([xs, x]) =>
      (xs.push(x), xs))
        (parAnd(acc) (tf)))
          (parOf([])) (ts);


const parAny =
  arrFold(acc => tf =>
    parOr(acc) (tf))
      (parEmpty);


/***[Derived]*****************************************************************/


const parAppend = parOr;


const parPrepend = parOr;


/******************************************************************************
*********************************[ PREDICATE ]*********************************
******************************************************************************/


const Pred = struct("Pred");


/***[Contravariant Functor]***************************************************/


const predContra = f => tf =>
  x => Pred(tf.runPred(f(x)));


/***[Monoid]******************************************************************/


const predEmpty = Pred(x => true);


/***[Semigroup]***************************************************************/


const predAppend = tf => tg =>
  Pred(x => tf.runPred(x) && tg.runPred(x));


const predPrepend = predAppend;


/******************************************************************************
******************************[ PRISM (OPTICS) ]*******************************
******************************************************************************/


// const Prism = struct("Prism"); Prism don't have its own type for the time beeing


/***[Instances]***************************************************************/


// Either


const leftPrism =
  Lens(({map, of}) => ft => tx =>
    match(tx, {
      type: "Either",
      get Left() {return map(Left) (ft(tx.runEither))},
      get Right() {return of(tx)}
    }));


const rightPrism =
  Lens(({map, of}) => ft => tx =>
    match(tx, {
      type: "Either",
      get Left() {return of(tx)},
      get Right() {return map(Right) (ft(tx.runEither))}
    }));


/***[Misc. Combinators]*******************************************************/


const prismGet = prism => tx => // TODO: falsify
  prism(constMap).runPrism(tx => Const(tx)) (tx);


const prismMod = prism => f => tx => // aka prismOver
  prism(idMap).runPrism(ty =>
    Id(optMap(f) (ty))) (tx);


const prismSet = prism => x => tx =>
  prism(idMap).runPrism(_const(Id(Some(x)))) (tx);


/******************************************************************************
**********************************[ PRODUCT ]**********************************
******************************************************************************/


const Prod = struct("Prod");


/***[Monoid]******************************************************************/


const prodEmpty = Prod(1);


/***[Semigroup]***************************************************************/


const prodAppend = tm => tn =>
  Sum(tm.runProd * tn.runProd);


const prodPrepend = prodAppend;


/******************************************************************************
**********************************[ READER ]***********************************
******************************************************************************/


const Reader = struct("Reader");


/***[Applicative]**************************************************************/


const readAp = tf => tg =>
  Reader(x => tf.runReader(x) (tg.runReader(x)));


const readOf = x => Reader(_ => x);


/***[Functor]******************************************************************/


const readMap = f => tg =>
  Reader(x => f(tg.runReader(x)));


/***[Monad]********************************************************************/


const readChain = fm => mg =>
  Reader(x => fm(mg.runReader(x)).runReader(x));


const readJoin = mmf =>
  Reader(x => mmf.runReader(x).runReader(x));


/***[Misc. Combinators]*******************************************************/


const ask = Reader(id);


const asks = f =>
  readChain(x => readOf(f(x))) (ask);


const local = f => tg =>
  Reader(x => tg.runReader(f(x)));


/******************************************************************************
******************************[ SETTER (OPTICS) ]******************************
******************************************************************************/


//const Setter = struct("Setter");


/***[Instances]***************************************************************/


// Object


const objSetter_ = objDel => k =>
  Lens(_ => ft => o =>
    idMap(v =>
      objUnionx(
        objDel(k) (o))
          (v === null
            ? {}
            : {[k]: v}))
                (ft(o[k])));


const objSetter = objSetter_(objDel);


const objSetterx = objSetter_(objDelx);


/***[Category]****************************************************************/


const setComp = tx => ty =>
  Lens(x => tx.runLens() (ty.runLens() (x)));


const setComp3 = tx => ty => tz =>
  Lens(x => tx.runLens() (ty.runLens() (tz.runLens() (x))));


const setId = Lens(id);


/***[Misc. Combinators]*******************************************************/


const setDel = tx => o =>
  tx.runLens(_const(Id(null))) (o);


const setMod = tx => f => o =>
  tx.runLens(v => Id(f(v))) (o);


const setSet = tx => v => o =>
  tx.runLens(_const(Id(v))) (o);


/******************************************************************************
***********************************[ STATE ]***********************************
******************************************************************************/


const State = struct("State");


/***[Applicative]*************************************************************/


const stateAp = tf => tx =>
  State(y => {
    const [f, y_] = tf.runState(y),
      [x, y__] = tx.runState(y_);

    return [f(x), y__];
  });


const stateOf = x => State(y => [x, y]);


/***[Functor]*****************************************************************/


const stateMap = f => tx =>
  State(y => {
    const [x, y_] = tx.runState(y);
    return [f(x), y_];
  });


/***[Monad]*******************************************************************/


const stateChain = fm => mx =>
  State(y => {
    const [x, y_] = mx.runState(y);
    return fm(x).runState(y_);
  });


/***[Misc. Combinators]*******************************************************/


const evalState = tf =>
  y => tf.runState(y) [0];


const execState = tf =>
  y => tf.runState(y) [1];


const stateGet = State(y => [y, y]);


const stateGets = f =>
  stateChain(y => stateOf(f(x))) (stateGet);


const stateModify = f =>
  stateChain(y => statePut(f(y))) (stateGet);


const statePut = y => State(_ => [null, y]);


/******************************************************************************
**********************************[ STREAM ]***********************************
******************************************************************************/


const Stream = union("Stream");


const Yield = value => next =>
  Stream("Yield", {value, next});


const Skip = next =>
  Stream("Skip", {next});


const Return = value =>
  Stream("Return", {value});


/******************************************************************************
************************************[ SUM ]************************************
******************************************************************************/


const Sum = struct("Sum");


/***[Monoid]******************************************************************/


const sumEmpty = Sum(0);


/***[Semigroup]***************************************************************/


const sumAppend = tm => tn =>
  Sum(tm.runSum + tn.runSum);


const sumPrepend = sumAppend;


/******************************************************************************
*************************[ TASK (ASYNC IN SEQUENCE) ]**************************
******************************************************************************/


const Task = structGetter("Task")
  (Task => k => Task(thisify(o => {
    o.runTask = (res, rej) => k(x => {
      o.runTask = l => l(x);
      return res(x);
    }, rej);
    
    return o;
  })));


/***[Applicative]*************************************************************/


const tAp = tf => tx =>
  Task((res, rej) => tf.runTask(f => tx.runTask(x => res(f(x)), rej), rej));


const tLiftA2 = f => tx => ty =>
  tAp(tMap(f) (tx)) (ty);


const tOf = x => Task((res, rej) => res(x));


/***[Foldable]****************************************************************/


const tCata = alg => tf.runTask;


/***[Functor]*****************************************************************/


const tMap = f => tx =>
  Task((res, rej) => tx.runTask(x => res(f(x)), rej));


/***[Monad]*******************************************************************/


const tChain = fm => mx =>
  Task((res, rej) => mx.runTask(x => fm(x).runTask(res, rej), rej));


const tChain2 = fm => mx => my =>
  Task((res, rej) => mx.runTask(x =>
    my.runTask(y =>
      fm(x) (y).runTask(res, rej), rej), rej));


const tChainT = ({chain, of}) => fm => mmx => // NOTE: fm only returns the inner monad hence of is necessary
  chain(mx =>
    of(tChain(fm) (mx))) (mmx);


const tJoin = mmx =>
  Task((res, rej) => mmx.runTask(mx => mx.runTask(res, rej), rej));


const tLiftM2 = f => mx => my =>
  tChain(mx) (x => tChain(my) (y => tOf(f(x) (y))));


/***[Monoid]*******************************************************************/


const tEmpty = x => Task((res, rej) => res(x));


/***[Misc. Combinators]*******************************************************/


const tAnd = tf => tg =>
  Task((res, rej) =>
    tf.runTask(f =>
      tg.runTask(g =>
        res([f, g]), rej),
        rej));


const tAll = ts => // eta abstraction to create a new tOf([]) for each invocation
  arrFold(acc => tf =>
    tMap(([xs, x]) =>
      (xs.push(x), xs))
        (tAnd(acc) (tf)))
          (tOf([])) (ts);



/***[Derived]*****************************************************************/


const tAppend = tAnd;


const tPrepend = flip(tAnd);


/******************************************************************************
***********************************[ THESE ]***********************************
******************************************************************************/


const These_ = union("These");


const This = x =>
  These_("This", x);


const That = x =>
  These_("That", x);


const These = (x, y) =>
  These_("These", [x, y]);


/***[Foldable]****************************************************************/


const theseCata = _this => that => these => tx =>
  match(tx, {
    type: "These",
    get This() {return _this(tx.runThese)},
    get That() {return that(tx.runThese)},
    get These() {return these(...tx.runThese)}
  });


/***[Misc. Combinators]*******************************************************/


const fromThese = (x, y) => tx =>
  match(tx) ({
    type: "These",
    get This() {return [tx.runThese, y]},
    get That() {return [x, tx.runThese]},
    get These() {return tx.runThese}
  });


/******************************************************************************
********************************[ TRANSDUCER ]*********************************
******************************************************************************/


const dropper = n => reduce => { 
  let m = 0;

  return acc => x =>
    m < n
      ? (m++, acc)
      : reduce(acc) (x);
};


const dropperk = n => reduce => { 
  let m = 0;

  return acc => x => k =>
    m < n
      ? (m++, k(acc))
      : reduce(acc) (x).runCont(k)};


const dropperNth = nth => reduce => { 
  let n = 0;

  return acc => x =>
    ++n % nth === 0
      ? acc
      : reduce(acc) (x);
};


const dropperNthk = nth => reduce => { 
  let n = 0;

  return acc => x => k =>
    ++n % nth === 0
      ? k(acc)
      : reduce(acc) (x).runCont(k)};


const dropperWhile = p => reduce => {
  let drop = true;

  return acc => x => 
    drop && p(x)
      ? acc
      : (drop = false, reduce(acc) (x));
};


const dropperWhilek = p => reduce => {
  let drop = true;

  return acc => x =>
    Cont(k =>
      drop && p(x)
        ? k(acc)
        : (drop = false, reduce(acc) (x).runCont(k)))};


const filterer = p => reduce => acc => x =>
  p(x)
    ? reduce(acc) (x)
    : acc;


const filtererk = p => reduce => acc => x =>
  Cont(k =>
    p(x)
      ? reduce(acc) (x).runCont(k)
      : k(acc));


const mapper = f => reduce => acc => x =>
  reduce(acc) (f(x));


const mapperk = f => reduce => acc => x =>
  Cont(k =>
    reduce(acc) (f(x)).runCont(k));


const taker = n => reduce => { 
  let m = 0;

  return acc => x =>
    m < n
      ? (m++, reduce(acc) (x))
      : acc;
};


const takerk = n => reduce => { 
  let m = 0;

  return acc => x =>
    Cont(k =>
      m < n
        ? (m++, reduce(acc) (x).runCont(k))
        : acc)};


const takerNth = nth => reduce => { 
  let n = 0;

  return acc => x =>
    ++n % nth === 0
      ? reduce(acc) (x)
      : acc;
};


const takerNthk = nth => reduce => { 
  let n = 0;

  return acc => x =>
    Cont(k =>
      ++n % nth === 0
        ? reduce(acc) (x).runCont(k)
        : acc)};


const takerWhile = p => reduce => acc => x =>
  p(x)
    ? reduce(acc) (x)
    : acc;


const takerWhilek = p => reduce => acc => x =>
  Cont(k =>
    p(x)
      ? reduce(acc) (x).runCont(k)
      : acc);


/******************************************************************************
****************************[ TRAVERSAL (OPTICS) ]*****************************
******************************************************************************/


// TODO: add


/******************************************************************************
***********************************[ TUPLE ]***********************************
******************************************************************************/


const Pair = structn("Pair")
  (Pair => (x, y) => Pair([x, y]));


const Pair_ = structn("Pair")
  (Pair_ => x => y => Pair_([x, y]));


const Triple = struct("Triple")
  (Triple => (x, y, z) => Triple([x, y, z]));


const Triple_ = structn("Triple")
  (Triple_ => x => y => z => Triple_([x, y, z]));


/***[Bifunctor]***************************************************************/


const tupBimap = f => g => ([x, y]) =>
  [f(x), g(y)];


/***[Functor]*****************************************************************/


const tupMap = f => ([x, y]) =>
  [f(x), y];


const tupSecond = f => ([x, y]) =>
  [x, f(y)];


const tupThird = f => ([x, y, z]) =>
  [x, y, f(z)];


/***[Trifunctor]**************************************************************/


const tupTrimap = f => g => h => ([x, y, z]) =>
  [f(x), g(y), h(z)];


/***[Misc. Combinators]*******************************************************/


const tup1 = ([x]) => x;


const tup2 = ([x, y]) => y;


const tup3 = ([x, y, z]) => z;


/******************************************************************************
**********************************[ WRITER ]***********************************
******************************************************************************/


const Writer = structn("Writer")
  (Writer => (x, y) => Writer([x, y]));


/***[Applicative]*************************************************************/


const writeAp = append => ({runWriter: [f, y]}) => ({runWriter: [x, y_]}) =>
  Writer(f(x), append(y) (y_));  


const writeOf = empty => x =>
  Writer(x, empty);


/***[Functor]*****************************************************************/


const writeMap = f => ({runWriter: [x, y]}) =>
  Writer(f(x), y);


/***[Monad]*******************************************************************/


const writeChain = append => fm => ({runWriter: [x, y]}) => {
  const [x_, y_] = fm(x).runWriter;
  return Writer(x_, append(y) (y_));
};


/***[Misc. Combinators]*******************************************************/


const evalWriter = tx =>
  tx.runWriter(([x, y]) => x);


const execWriter = tx =>
  tx.runWriter(([x, y]) => y);


const writeCensor = f => mx =>
  pass(mx.runWriter(pair => Writer(pair, f)));


const writeListen = tx =>
  tx.runWriter(([x, y]) => Writer([x, y], y));


const writeListens = f => mx =>
  listen(mx).runWriter(([pair, y]) => Writer(pair, f(y)));


const writePass = tx =>
  tx.runWriter(([[x, f], y]) => Writer([x, f(x)]));


const writeTell = y => Writer(null, y);


/******************************************************************************
**********************************[ DERIVED ]**********************************
******************************************************************************/


const arrAll = all({ // with short circuit semantics
  fold: arrFoldk,
  append: compBin(tx =>
    Cont(k =>
      tx.runAll
        ? k(tx)
        : tx))
            (allAppend),
  empty: allEmpty});


const arrAny = any({ // with short circuit semantics
  fold: arrFoldk,
  append: compBin(tx =>
    Cont(k =>
      tx.runAny
        ? tx
        : k(tx)))
            (anyAppend),
  empty: anyEmpty});


const firstPrepend = lastAppend;


/******************************************************************************
*******************************************************************************
***********************[ HASHED ARRAY MAP TRIE (HAMT) ]************************
*******************************************************************************
******************************************************************************/


/******************************************************************************
*********************************[ CONSTANTS ]*********************************
******************************************************************************/


const HAMT_BITS = 5;


const HAMT_SIZE = Math.pow(2, HAMT_BITS);


const HAMT_MASK = HAMT_SIZE - 1;


const HAMT_LEAF = "Leaf";


const HAMT_BRANCH = "Branch";


const HAMT_COLLISION = "Collision";


const HAMT_DELETE = "delete";


const HAMT_NOOP = "noop";


/******************************************************************************
*********************************[ CONSTANTS ]*********************************
******************************************************************************/


let hamtObjKeys = new WeakMap();


/******************************************************************************
***********************************[ HASH ]************************************
******************************************************************************/


const hamtHash = k => {
  switch (typeof k) {
    case "string":
      return hamtStrHash(k);

    case "number":
      return k === 0 ? 0x42108420
        : k !== k ? 0x42108421
        : k === Infinity ? 0x42108422
        : k === -Infinity ? 0x42108423
        : (k % 1) > 0 ? hamtStrHash(k + "") // string hashes for floats
        : hamtNumHash(k);

    case "boolean":
      return k === false
        ? 0x42108424
        : 0x42108425;

    case "undefined":
      return 0x42108426;

    case "function":
    case "object":
    case "symbol": {
      if (k === null)
        return 0x42108427;

      else if (hamtObjKeys.has(k))
        return hamtObjKeys.get(k);

      else {
        const k_ = crypto.getRandomValues(
          new Uint32Array(1)) [0];

        hamtObjKeys.set(k, k_);
        return k_;
      }
    }
  }
};


const hamtStrHash = s => {
  let r = 0x811c9dc5;

  for (let i = 0, l = s.length; i < l; i++) {
    r ^= s.charCodeAt(i);
    r = Math.imul(r, 0x1000193);
  }

  return r >>> 0;
};


const hamtNumHash = n =>
{
  n = (n + 0x7ed55d16) + (n << 12);
  n = (n ^ 0xc761c23c) ^ (n >> 19);
  n = (n + 0x165667b1) + (n << 5);
  n = (n + 0xd3a2646c) ^ (n << 9);
  n = (n + 0xfd7046c5) + (n << 3);
  n = (n ^ 0xb55a4f09) ^ (n >> 16);
  return n >>> 0;
};


/******************************************************************************
*****************************[ POPULATION COUNT ]******************************
******************************************************************************/


const hamtPopCount = (x, n) => {
  if (n !== undefined)
    x &= (1 << n) - 1;

  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return Math.imul(x, 0x01010101) >> 24;
};


/******************************************************************************
*******************************[ CONSTRUCTORS ]********************************
******************************************************************************/


const hamtBranch = (mask = 0, children = []) => ({
  type: HAMT_BRANCH,
  mask,
  children
});


const hamtCollision = (hash, children) => ({
  type: HAMT_COLLISION,
  hash,
  children
});


const hamtLeaf = (hash, k, v) => ({
  type: HAMT_LEAF,
  hash,
  k,
  v
});


/******************************************************************************
************************************[ API ]************************************
******************************************************************************/


const hamtDel = (hamt, k) => {
  if (hamt.type !== HAMT_BRANCH)
    throw new TypeError("invalid HAMT");

  const hash = hamtHash(k),
    hamt_ = hamtDelNode(hamt, hash, k, 0);

  if (hamt_ === HAMT_NOOP)
    return hamt;

  else if (hamt_ === HAMT_DELETE)
    return hamtEmpty;

  else return hamt_;
};


const hamtEmpty = hamtBranch();


const hamtGet = (hamt, k) => {
  if (hamt.type !== HAMT_BRANCH)
    throw new TypeError("invalid HAMT"); // TODO: change to HAMT error

  const hash = hamtHash(k);

  let node = hamt,
    depth = -1;

  while (true) {
    ++depth;

    switch (node.type) {
      case HAMT_BRANCH: {
        const frag = (hash >>> (HAMT_BITS * depth)) & HAMT_MASK,
          mask = 1 << frag;

        if (node.mask & mask) {
          const i = hamtPopCount(node.mask, frag);
          node = node.children[i];
          continue;
        }

        else
          return undefined;
      }

      case HAMT_COLLISION: {
        for (let i = 0, len = node.children.length; i < len; ++i) {
          const child = node.children[i];

          if (child.k === k)
            return child.v;
        }

        return undefined;
      }

      case HAMT_LEAF: {
        return node.k === k
          ? node.v
          : undefined;
      }
    }
  }
};


const hamtSet = (hamt, k, v) => {
  if (hamt.type !== HAMT_BRANCH)
    throw new TypeError("invalid HAMT");

  const hash = hamtHash(k);
  return hamtSetNode(hamt, hash, k, v);
};


/******************************************************************************
******************************[ IMPLEMENTATION ]*******************************
******************************************************************************/


const hamtSetNode = (node, hash, k, v, depth = 0) => {
  const frag = (hash >>> (HAMT_BITS * depth)) & HAMT_MASK,
    mask = 1 << frag;

  switch (node.type) {
    case HAMT_LEAF: {
      if (node.hash === hash) {
        if (node.k === k)
          return hamtLeaf(hash, k, v)

        return hamtCollision(
          hash,
          [node, hamtLeaf(hash, k, v)]);
      }

      else {
        const prevFrag = (node.hash >>> (HAMT_BITS * depth)) & HAMT_MASK;

        if (prevFrag === frag)
          return hamtBranch(
            mask, [
              hamtSetNode(
                hamtSetNode(hamtEmpty, hash, k, v, depth + 1),
              node.hash,
              node.k,
              node.v,
              depth + 1)
            ]
          );

        const prevMask = 1 << prevFrag,
          children = prevFrag < frag
            ? [node, hamtLeaf(hash, k, v)]
            : [hamtLeaf(hash, k, v), node];

        return hamtBranch(mask | prevMask, children);
      }
    }

    case HAMT_BRANCH: {
      const i = hamtPopCount(node.mask, frag),
        children = node.children;

      if (node.mask & mask) {
        const child = children[i],
          children_ = Array.from(children);

        children_[i] = hamtSetNode(child, hash, k, v, depth + 1);
        return hamtBranch(node.mask, children_);
      }

      else {
        const children_ = Array.from(children);
        children_.splice(i, 0, hamtLeaf(hash, k, v));
        return hamtBranch(node.mask | mask, children_);
      }
    }

    case HAMT_COLLISION: {
      for (let i = 0, len = node.children.length; i < len; ++i) {
        if (node.children[i].k === k) {
          const children = Array.from(node.children);
          children[i] = hamtLeaf(hash, k, v);
          return hamtCollision(node.hash, children);
        }
      }

      return hamtCollision(
        node.hash,
        node.children.concat(hamtLeaf(hash, k, v))
      );
    }
  }
}


const hamtDelNode = (node, hash, k, depth) => {
  const frag = (hash >>> (HAMT_BITS * depth)) & HAMT_MASK,
    mask = 1 << frag;

  switch (node.type) {
    case HAMT_LEAF: {
      // null means remove, undefined
      // means do nothing
      return node.k === k ? HAMT_DELETE : HAMT_NOOP;
    }

    case HAMT_BRANCH: {
      if (node.mask & mask) {
        const i = hamtPopCount(node.mask, frag),
          node_ = hamtDelNode(node.children[i], hash, k, depth + 1);

        if (node_ === HAMT_DELETE) {
          const newMask = node.mask & ~mask;

          if (newMask === 0)
            return HAMT_DELETE;
          
          else {
            const children = Array.from(node.children);
            children.splice(i, 1);
            return hamtBranch(newMask, children);
          }
        }

        else if (node_ === HAMT_NOOP)
          return HAMT_NOOP;

        else {
          const children = Array.from(node.children);
          children[i] = node_;
          return hamtBranch(node.mask, children);
        }
      }

      else
        return HAMT_NOOP;
    }

    case HAMT_COLLISION: {
      if (node.hash === hash) {
        for (let i = 0, len = node.children.length; i < len; ++i) {
          const child = node.children[i];

          if (child.k === k) {
            const children = Array.from(node.children);
            children.splice(i, 1);
            return hamtCollision(node.hash, children);
          }
        }
      }

      return HAMT_NOOP;
    }
  }
}


/******************************************************************************
*******************************************************************************
************************************[ IO ]*************************************
*******************************************************************************
******************************************************************************/


/******************************************************************************
********************************[ FILE SYSTEM ]********************************
******************************************************************************/


const fileCopy_ = fs => flags => newPath => path =>
  Task((res, rej) => {
    const readStream = fs.createReadStream(path),
      writeStream = fs.createWriteStream(newPath, {flags});

    readStream.on("error", rej);
    writeStream.on("error", rej);
    writeStream.on("finish", () => res(newPath));
    readStream.pipe(writeStream);
  });


const fileMove_ = fs => flags => newPath => path =>
  renameFile(path, newPath)
    .runTask(id, e => {
      if (e.code !== "EXDEV") // TODO: there are other error codes to take into account
        throw new FileError(e);

      else
        return tAnd(
          copyFile(path, newPath, flags))
            (unlinkFile(path));
    });


const fileRead_ = fs => enc => path =>
  Task((res, rej) =>
    fs.readFile(path, enc, (e, s) =>
      e ? rej(e) : res(s)));


const fileRename_ = fs => newPath => path => 
  Task((res, rej) => {
    fs.rename(path, newPath, e =>
      e ? rej(e) : res(newPath));
  });


const fileScanDir_ = fs => path =>
  Task((res, rej) =>
    fs.readdir(path, (e, ss) =>
      e ? rej(e) : res(ss)));


const fileWrite_ = fs => opt => path => s =>
  Task((res, rej) =>
    fs.writeFile(path, s, opt, (e, s) =>
      e ? rej(e) : res(None)));


const fileUnlink_ = fs => path => 
  Task((res, rej) => {
    fs.unlink(path, e =>
      e ? rej(e) : res(None));
  });


/******************************************************************************
*******************************************************************************
**********************************[ DERIVED ]**********************************
*******************************************************************************
******************************************************************************/


const arrSum = arrFoldM({append: sumAppend, empty: sumEmpty});


/******************************************************************************
*******************************************************************************
************************************[ API ]************************************
*******************************************************************************
******************************************************************************/


module.exports = {
  Age,
  All,
  all,
  allAppend,
  allEmpty,
  allPrepend,
  Ancient,
  and,
  andp,
  Any,
  any,
  anyAppend,
  anyEmpty,
  anyPrepend,
  apConst,
  apConst_,
  app,
  app_,
  apply,
  apply_,
  appr,
  arrAll,
  arrAlt,
  arrAltx,
  arrAny,
  arrAp,
  arrApConstl,
  arrApConstr,
  arrApo,
  arrAppend,
  arrAppendx,
  arrChain,
  arrChain2,
  arrChainRec,
  arrClone,
  arrConcat,
  arrCons,
  arrConsHead,
  arrConsHeadx,
  arrConsNth,
  arrConsNthx,
  arrConsx,
  arrCreateMatrix,
  arrDedupe,
  arrDedupeBy,
  arrDedupeOn,
  arrDel,
  arrDelx,
  arrEmpty,
  arrFilter,
  arrFold,
  arrFoldk,
  arrFoldM,
  arrFoldr,
  arrFoldStr,
  arrFutu,
  arrHead,
  arrHeadOr,
  arrInit,
  arrInvert,
  arrLast,
  arrLastOr,
  arrLens,
  arrLensx,
  arrLiftA2,
  arrLiftM2,
  arrHisto,
  arrHylo,
  arrJoin,
  arrLength,
  arrMap,
  arrMapA,
  arrMapAdjacent,
  arrMapChunk,
  arrMapConst,
  arrMapx,
  arrModOr,
  arrModOrx,
  arrMutu,
  arrNull,
  arrOf,
  arrPara,
  arrParak,
  arrPartition,
  arrPrepend,
  arrPrependx,
  arrScan,
  arrSeqA,
  arrSet,
  arrSetx,
  arrSliceAt,
  arrSliceAtx,
  arrSortBy,
  arrSortByx,
  arrSplitAt,
  arrSplitAtx,
  arrSplitBy,
  arrSplitByx,
  arrSum,
  arrTail,
  arrTransduce,
  arrTransducek,
  arrTranspose,
  arrUnconsHead,
  arrUnconsHeadOr,
  arrUnconsHeadOrx,
  arrUnconsHeadx,
  arrUnconsInit,
  arrUnconsInitx,
  arrUnconsLast,
  arrUnconsLastOr,
  arrUnconsLastOrx,
  arrUnconsLastx,
  arrUnconsNth,
  arrUnconsNthx,
  arrUnconsNthOr,
  arrUnconsNthOrx,
  arrUnconsTail,
  arrUnconsTailx,
  arrUnfold,
  arrUnzip,
  arrZero,
  arrZip,
  arrZipBy,
  arrZygo,
  ascOrder,
  ascOrder_,
  ask,
  asks,
  Base,
  ceil,
  Comp,
  comp,
  comp2nd,
  compBin,
  compAp,
  compAppend,
  Compare,
  compare,
  compContra,
  compEmpty,
  compMap,
  compOf,
  compOn,
  compPrepend,
  concrat,
  Const,
  _const,
  const_,
  constMap,
  constOf,
  Cont,
  cont,
  cont2,
  contAp,
  contChain,
  contChain2,
  contChainRec,
  contJoin,
  contLiftA2,
  contLiftM2,
  contMap,
  contReset,
  contShift,
  contOf,
  curry,
  curry3,
  curry4,
  curry5,
  curry6,
  DateError,
  dateParse,
  debug,
  defAp,
  defChain,
  defChainRec,
  Defer,
  defJoin,
  defMap,
  defOf,
  delay,
  descOrder,
  descOrder_,
  Done,
  dropper,
  dropperk,
  dropperNth,
  dropperNthk,
  dropperWhile,
  dropperWhilek,
  eff,
  Either,
  Endo,
  endoAppend,
  endoEmpty,
  endoPrepend,
  _enum,
  EnumError,
  EQ,
  eq,
  Equiv,
  equivAppend,
  equivContra,
  equivEmpty,
  equivPrepend,
  ethCata,
  evalState,
  execState,
  fileCopy_,
  FileError,
  fileMove_,
  fileRead_,
  fileRename_,
  fileScanDir_,
  fileWrite_,
  fileUnlink_,
  filterer,
  filtererk,
  First,
  firstAppend,
  firstPrepend,
  fix,
  flip,
  floor,
  foldMap,
  formatDate,
  formatDay,
  formatFloat,
  formatMonth,
  formatYear,
  fromThese,
  funAp,
  funAppend,
  funChain,
  funChain_,
  funContra,
  funDimap,
  funEmpty,
  funJoin,
  funLiftA2,
  funLmap,
  funMap,
  funPrepend,
  funRmap,
  getComp,
  getComp3,
  getDay,
  getGet,
  getId,
  getMonth,
  getMonthDays,
  getTimezoneOffset,
  getYear,
  GT,
  guard,
  hamtDel,
  hamtEmpty,
  hamtGet,
  hamtSet,
  headH,
  History,
  history,
  Id,
  id,
  idMap,
  idOf,
  imply,
  index,
  infix,
  infix2,
  infix3,
  infix4,
  infix5,
  infix6,
  infixM2,
  infixM3,
  infixM4,
  infixM5,
  infixM6,
  infixr,
  infixr2,
  infixr3,
  infixr4,
  infixr5,
  infixr6,
  infixrM2,
  infixrM3,
  infixrM4,
  infixrM5,
  infixrM6,
  inRange,
  invoke,
  introspect,
  isDate,
  isDateStr,
  isFalse,
  isIntStr,
  isTrue,
  isUnit,
  kleisli,
  kleisli_,
  Last,
  lastAppend,
  lastPrepend,
  Lazy,
  lazyAp,
  lazyChain,
  lazyChainRec,
  lazyJoin,
  lazyMap,
  lazyOf,
  Left,
  leftPrism,
  Lens,
  lensComp,
  lensComp3,
  lensDel,
  lensGet,
  lensId,
  lensMod,
  lensSet,
  _let,
  local,
  log,
  Loop,
  Loop_,
  loopChain,
  loopOf,
  LT,
  _Map,
  mapConst,
  mapMap,
  mapDel,
  mapDelx,
  mapGet,
  mapGetOr,
  mapLens,
  mapLensx,
  mapModOr,
  mapModOrx,
  mapSet,
  mapSetx,
  mapper,
  mapperk,
  matCata,
  match,
  match2,
  match3,
  Matched,
  Max,
  max,
  maxEmpty,
  maxAppend,
  maxPrepend,
  Min,
  min,
  minAppend,
  minEmpty,
  minPrepend,
  monadAp,
  monadRec,
  neq,
  _new,
  None,
  not,
  NOT_FOUND,
  notp,
  numCompare,
  numEq,
  numFromEnum,
  numNeq,
  numGt,
  numGte,
  numLt,
  numLte,
  numMaxBound,
  numMinBound,
  numPred,
  numSucc,
  numToEnum,
  objClone,
  objDel,
  objDelx,
  objEntries,
  objGetOr,
  objGetter,
  objKeys,
  objLens,
  objLensx,
  objMemo,
  objModOr,
  objModOrx,
  objSet,
  objSetter,
  objSetx,
  objUnion,
  objUnionx,
  objValues,
  Option,
  optAp,
  optCata,
  optChain,
  optChainT,
  optLiftA2,
  optMap,
  optOf,
  or,
  ordAppend,
  ordCata,
  ordEmpty,
  ordPrepend,
  Ordering,
  orp,
  Pair,
  Pair_,
  Parallel,
  parAll,
  parAnd,
  parAny,
  parAp,
  parAppend,
  parCata,
  parEmpty,
  parMap,
  parOf,
  parOr,
  parPrepend,
  partial,
  pipe,
  pipe_,
  pipeBin,
  pipeOn,
  Pred,
  predAppend,
  predContra,
  predEmpty,
  predPrepend,
  prismGet,
  prismMod,
  prismSet,
  Prod,
  prodAppend,
  prodEmpty,
  prodPrepend,
  range,
  rangeSize,
  Reader,
  readAp,
  readChain,
  readJoin,
  readMap,
  readOf,
  Recur,
  RegExpError,
  Return,
  Right,
  rightPrism,
  round,
  roundBy,
  ScriptumError,
  select,
  select11,
  select1N,
  SemigroupError,
  _Set,
  setComp,
  setComp3,
  setDel,
  setId,
  setMap,
  setMod,
  setSet,
  Some,
  State,
  stateAp,
  stateChain,
  stateGet,
  stateGets,
  stateMap,
  stateModify,
  stateOf,
  statePut,
  strAppend,
  strCapWord,
  strChunk,
  strConsNth,
  strDel,
  strFold,
  strFoldChunks,
  strLength,
  strLens,
  strLocaleCompare,
  strMatch,
  strMatchAll,
  strMatchLast,
  strMatchNth,
  strMod,
  strNormalize,
  strNormalizeBy,
  strNull,
  strSet,
  strPadl,
  strPadr,
  strPrepend,
  strSliceAt,
  strSplitAt,
  strSplitBy,
  strSplitWords,
  strTrim,
  struct,
  structn,
  structRun,
  strUnconsNth,
  strUnconsNthOr,
  Sum,
  sumAppend,
  sumEmpty,
  sumPrepend,
  taker,
  takerk,
  takerNth,
  takerNthk,
  takerWhile,
  takerWhilek,
  Task,
  taggedLog,
  tailRec,
  tAnd,
  tAll,
  tAp,
  tAppend,
  tCata,
  tChain,
  tChainT,
  tChain2,
  tEmpty,
  tPrepend,
  That,
  These,
  These_,
  theseCata,
  This,
  thisify,
  _throw,
  tJoin,
  tLiftA2,
  tLiftM2,
  tMap,
  tOf,
  toFixedFloat,
  Triple,
  Triple_,
  strToLower,
  strToUpper,
  toString,
  trace,
  tryCatch,
  tup1,
  tup2,
  tup3,
  tupBimap,
  tupSecond,
  tupThird,
  tupTrimap,
  TYPE,
  uncurry,
  uncurry3,
  uncurry4,
  uncurry5,
  uncurry6,
  union,
  union0,
  UnionError,
  unionRun,
  Writer,
  writeAp,
  writeCensor,
  writeChain,
  writeListen,
  writeListens,
  writeMap,
  writeOf,
  writePass,
  writeTell,
  Yield,
};
