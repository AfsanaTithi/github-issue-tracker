
### Answers:
**1️⃣ What is the difference between var, let, and const?**
- `var`: It is function-scoped (or globally scoped). It can be re-declared and updated. It is hoisted to the top of its scope and initialized with `undefined`.
- `let`: It is block-scoped. It can be updated but not re-declared in the same scope. It is hoisted but not initialized, residing in a "temporal dead zone" until the declaration line.
- `const`: It is block-scoped like `let`. It cannot be updated or re-declared. It must be initialized at the time of declaration.

**2️⃣ What is the spread operator (...)?**
The spread operator allows an iterable (like an array or string) to be expanded in places where zero or more arguments or elements are expected, or an object expression to be expanded where zero or more key-value pairs are expected. It is extremely useful for copying arrays, merging objects, or passing array elements as separate function arguments without using `.apply()`.

**3️⃣ What is the difference between map(), filter(), and forEach()?**
- `map()`: Iterates over an array and returns a new array containing the results of applying a provided callback function to each element. It transforms data.
- `filter()`: Iterates over an array and returns a new array with all elements that pass the test implemented by the provided callback function. It filters data.
- `forEach()`: Iterates over an array and executes the provided callback function for each element, returning `undefined`. It is mostly used for executing side effects (like logging or modifying external variables).

**4️⃣ What is an arrow function?**
An arrow function (`() => {}`) is a syntactically compact alternative to a regular function expression. Importantly, arrow functions do not have their own `this` or `arguments` bindings; they inherit `this` from the surrounding lexical scope, making them very useful for callbacks and methods inside classes where context needs to be preserved.

**5️⃣ What are template literals?**
Template literals are string literals allowing embedded expressions. They use backticks (`` ` ``) rather than single or double quotes. They make string interpolation and composing multi-line strings much cleaner by letting you directly embed variables and expressions using the `${expression}` syntax.

---
