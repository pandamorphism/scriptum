## Values, Expressions and Functions

This first chapter introduces important functional programming jargon and illustrates some fundamental notions of the paradigm.

### First class values

Values are the result of expressions that cannot be evaluated any further. In Javascript we can represent values of many data types in literal form:

```javascript
"foo"
123
true
[1, 2, 3]
{foo: "bar"}
a => a
/^[A-Z]$/
```
You can pass values to and return them from functions. This trait is referred to as first class. Values are first class entities.

### First class expressions

Values are the most fundamental entity of programming but not particularly useful on their own. Fortunately we can generalize them to expressions. Generally speaking (pun intended) the process of generalization means to make things more useful, i.e. applicable to a wide range of scenarios.

```javascript
"foo" + "bar"
123 – 1
true && false
[1, 2, 3] [0]
({foo: "bar").foo
(a => a) ("foo")
```
Since an expression can be reduced to a single value during evaluation, it is also a first class entity. Expressions are a great improvement compared to mere values. But we can only use them ad-hoc, that is in place and as is. Is there a way to make them less ad-hoc? Let us generalize further!

### First class functions

Imagine named expressions with holes in them and a mechanism to fill these holes when needed. Such generalized expressions would be way more flexible because their results vary by means of the provided values. I am obviously talking about functions. Since functions are just expressions with holes in them they are also first class entities.

```javascript
const foo = hole => `expression with a ${hole} in it`;
foo("bar") // expression
```
We can call `foo` once, twice, several times or not at all. It is only evaluated when needed. This is the call-by-need evaluation strategy that purely functional programming languages like Haskell pursue as a default for every computation. Functions are inherently lazy.

Additionally we can compose functions if the types matches, that is we can create complex functions out of simpler ones and hence complex expressions out ouf simpler ones.

```javascript
add(length("foo")) (length("bar"))
```
When functions are just first class expressions with holes in them what differentiates them from, say, literals or other expressions? Nothing actually, apart from the fact that they are more general. This is exactly how we regard functions in functional programming: They are just ordinary values and we treat them accordingly.

### Pure functions

Admittedly, I oversimplified a bit. In fact three restrictions are necessary in order that functions are able to act like ordinary values:

* they must return a result value no matter what arguments are provided
* they must return the same result value for the same arguments
* they must not perform another visible effect than creating and returning a result value

The first restriction forms total functions and we are going to discuss them in the next paragraph. The latter two constitute pure functions. A pure function must be deterministic and must not perform visible side effects so that you can substitute its invocations with the respective result values without changing the behavior of the program. In the literature this restriction is called referential transparency. Only such pure functions can be regarded as ordinary values.

These two related questions frequently come up on the topic:

* if a function declaration includes impure expressions but the effect(s) are not visible outside the function scope, calling it can be still considered a pure expression
* if an otherwise pure function depends on an impure one it is also impure, because impurity is infectious

### Total and partial functions

The functional paradigm considers functions as mappings from domain (arguments) to codomain (result values). If every argument (or set of arguments) yields a result value we are talking about total functions. Otherwise it is a partial one:

```javascript
const head = xs => xs[0];
head([1, 2, 3]); // 1
head([]); // undefined
```
`head` is a partial function because it returns undefined in certain cases, which indicates a type error. You should either avoid such functions or throw an error explicitly instead of silently returning `undefined`. Partial functions are per se less predictable and reliable than total functions.

You can transform any partial function into a total one by using the `Option` type. `Option` is one of the most common functional types. It will be covered in a later chapter.

### Higher order functions

We are not done generalizing. If functions are just first class values let us pass a function to another one and see what is happening:

```javascript
const app = f => x => f(x);
const add = x => y => x + y;
const sub = x => y => x – y;

app(add) (2) (3) // 5
app(sub) (2) (3) // -1
```
What we are doing here is a kind of dependency injection. Such functions are called higher order functions, because they expect at least one function argument. Consequently functions without a function argument are called first order functions.

Please note that a function without function arguments that returns another function is not a higher order function but a curried one. We will deal with currying in a later chapter of this course..

You can most likely imagine how powerful higher order functions are, since they are so generalized. As I have already mentioned the process of generalization means to make things more useful.

### Are statements harmful?

No, but they are like dead ends in your code, because they are decoupled from one another. Since they do not evaluate to a value you need to bind their (intermediate) results to names explicitly in order to use them in other statements. As a result you have to declare a lot of name bindings to store all these accruing intermediate values:

```javascript
const x = 1 + 2;
const y = 2 + 3;
const z = x * y;
```
I use the term name binding instead of variable, because there is no such thing as a variable in functional programming. All we can do is bind immutable values to names. Name bindings themselves are also immtuable, i.e. you cannot reassign them. In Javascript, however, this is just a policy we need to adhere to.

Later in this course you will see that statements obstruct the functional control flow, which consists of various forms of function composition.

### Operators as functions

While functions create nested structures as soon as you compose them consecutive operators remain flat: 

```javascript
add(add(1) (2)) (3); // nested
1 + 2 + 3; // flat
```
The reason for this opposite behavior lies in the different fixity of functions and operators. The fixity describes the position of an operator relative to its operands: 

```javascript
1 + 2; // infix position
add(1) (2); // prefix position
```
Infix notation comes along with two additional properties, namely precedence and associativity to determine in which order an expression has to be evaluated. As you can see functions and operators are not that different after all and it would be a nice feature if we could treat one as the other and vice versa. Unfortunately Javascript strictly distinguishes between the two.

So we are stuck with a fixed set of native Javascript operators without the ability to define new ones. Since operators are not first class it makes a lot of sense to complement them with their functional counterparts. This may aggravate the nesting issue, however, in a subsequent chapter we will examine special applicators that enable a linear data flow with a succinct and flat syntax.

### Undefined is not a proper value

scriptum and its underlying language Javascript are dynamically typed languages. That means there is a type system that should not be ignored. With `undefined` the type system is clearly telling you that there is a type error that needs to be fixed. As a rule of thumb your code should never intentionally create and only rarely be based on `undefined` as a last resort. You should not even consider it a proper value. `undefined` represents an error, a non-recoverable exception.

[TOC](https://github.com/kongware/scriptum#functional-programming-course-toc) | [next chapter &gt;](https://github.com/kongware/scriptum/blob/master/ch-2.md)
