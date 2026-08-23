// 1. Create variables :bunny using var, dog with let and cat with const.
    // var bunny = "Rabbit";
    // let dog = "Bingo";
    // const cat = "Puss in Boots";

    // console.log(bunny, dog, cat);



// 2. Which of these names are allowed in JavaScript?
    // 1bunny - invalid (cannot start with a number)
    // _bunny - valid
    // $bunny - valid
    // -bunny - invalid (hyphen is not allowed)
    // @bunny - invalid (@is not allowed)
    // bunnyName - valid



// 3 Predict the output, then run the code. In one or two sentences, explain why var and let behave differently here.
    
    // console.log(pet);    //undefined because var is hoisted.
    // var pet = 'lucy';   //so pet exists but has no value yet.

    // console.log(animal);    
    // let animal = 'tom';  //ReferenceError: Cannot access 'animal' before initialization

    

//4 Write two short examples: a local variable inside a function called animalName; a global variable that the same function can still print; Call the function and show both results.
    // let globalName = 'Thief';

    // function animalName() {
    //     //local variable
    //     let localName = 'Bola';

    //     console.log('Local variable:', localName);     //accessible only within the function
    //     console.log('Global variable:', globalName);   //accessible anywhere in the code

    // }        
    //     //call the function
    //     animalName();




// // // 5. Declare a variable named bunny and assign it an object
//     const bunny = {
//         name: "Rabbit",
//         age: 2,
//         isHappy: true
//     }
//         console.log(bunny.name);
//         console.log(bunny.age);
//         console.log(bunny.isHappy);


    
// // 6. For each value below, print the value and its type using typeof:
    // console.log(3.14, typeof 3.14);    
    // console.log('Lucy', typeof 'Lucy');
    // console.log(true, typeof true);
    // console.log(null, typeof null);
    // console.log(undefined, typeof undefined);
    // console.log(Symbol('Lucy'), typeof Symbol('Lucy'));
    // console.log({ name: 'Lucy' }, typeof { name: 'Lucy' });
    // console.log(['Lucy', 'Tom'], typeof ['Lucy', 'Tom']);



// // 7. Create an array called mixedDataTypes that holds at least one boolean, one number, one string, null, undefined, and one object. Print the array and its length.
    // const mixedDataTypes = [true, 25, 'Kelly', null, undefined, {name: 'Kells'}];
    // console.log(mixedDataTypes);
    // console.log('The mixedDataTypes Length is:', mixedDataTypes.length)



// // 8. Write a function sumBunnies that has no parameters. Inside it, create blackBunnies = 10 and whiteBunnies = 20, add them, and return the total. Call the function and print the result.
//     function sumBunnies() {
//         let blackBunnies = 10;
//         let whiteBunnies = 20;
//         return blackBunnies + whiteBunnies;
//     }
//     console.log(sumBunnies()); 


// // // 9. Rewrite sumBunnies so it takes two parameters, blackBunnies and whiteBunnies. Call it with sumBunnies(10, 20) and with sumBunnies(7, 3)
//     function sunBunnies(blackBunnies, whiteBunnies){
//         return blackBunnies + whiteBunnies;
//     }
//     console.log(sunBunnies(10, 20));    
//     console.log(sunBunnies(7, 3));      


// // // 10. Rewrite question 9 as: an anonymous function stored in a variable     an arrow function. Call both and print the results
//    const Anonymous = function(blackBunnies, whiteBunnies){
//     return blackBunnies + whiteBunnies;
//    }
//    console.log(Anonymous(10, 20));          
//    console.log(Anonymous(7, 3));            
   
//    const arrowFunction = (blackBunnies, whiteBunnies) => 
//      blackBunnies + whiteBunnies;
//    console.log(arrowFunction(10, 20));      
//    console.log(arrowFunction(7, 3));



//11 Write an IIFE that adds 10 black bunnies and 20 white bunnies and prints the total as soon as the file runs. Do not call it by name afterwards.
// (function() {
//     let blackBunnies = 10;
//     let whiteBunnies = 20;
//     console.log('Total bunnies:', blackBunnies + whiteBunnies);
// })();


// 12 Create an array called bunnies with six bunny names.
//  let bunnies = ['Tinubu', 'Buhari', 'Lucy', 'Okpebholo', 'Oshiomole', 'Akpabio'];
//  bunnies.push('Mario');
//  bunnies.unshift('Luigi');
//  bunnies = bunnies.filter(name => name !== 'Lucy');
//  console.log(bunnies);



 //13 Using this array:  const bunnies = ['Lucy', 'Tom', 'Molly', 'Bella'];
    // const bunnies = ['Lucy', 'Tom', 'Molly', 'Bella'];
    // console.log('First item;', bunnies[0]);
    // console.log('Last item:', bunnies[bunnies.length-1]);
    // console.log('Index of Tom:', bunnies.indexOf('Tom'));
    // console.log('This is a copy of the bunnies array:', [...bunnies]);



//14  Loop through bunnies with a for loop and print:
    // const bunnies = ['Lucy', 'Tom', 'Molly', 'Bella'];
    // for (let i = 0; i < bunnies.length; i) {
    //     console.log(`Bunny ${bunnies[i]} is scheduled for a checkup today.`);
    // }


//15 Using this nested array:
    // const nestedArrays = [
    //   ['Lucy', 'Tom'],
    //   ['Molly', 'Bella'],
    // ];

    // console.log(nestedArrays[0][0]);
    // console.log(nestedArrays[1][0]);

    // for (let i = 0; i < nestedArrays.length; i++) {
    //     for (let j = 0; j < nestedArrays[i].length; j++) {
    //         console.log(nestedArrays[i][j]);
    //     }
    // }


//16 Create a JavaScript object called bunny with name, age, and isHappy. Convert it to JSON, store it in bunnyJSON, and print bunnyJSON.
    // let bunny = {
    //     name: "Lucy",
    //     age: 3,
    //     isHappy: true 
    // }
    // let bunnyJSON = JSON.stringify(bunny);
    // console.log(bunnyJSON);



//17 Start with this JSON string: let bunnyJSON = '{"name":"Lucy","age":3,"isHappy":true}'; Convert it back to a JavaScript object and print name and age.
    // let bunnyJSON = '{"name":"Lucy","age":3,"isHappy":true}';
    // let bunny = JSON.parse(bunnyJSON);
    // console.log(bunny.name);
    // console.log(bunny.age);


//18 Comparison operators:
    // let bunny_age = 3;
    // let dog_age = '3';

    // console.log(bunny_age == dog_age);
    // console.log(bunny_age === dog_age);
    // console.log(bunny_age != dog_age);
    // console.log(bunny_age !== dog_age);


// 19 Create two arrays, bunnies and dogs, with any number of names. Use <= to compare their lengths.
    // let bunnies = ['Lucy', 'Tom', 'Molly', 'Bella'];
    // let dogs = ['Tinubu', 'Buhari', 'Okpebholo', 'Oshiomole', 'Akpabio'];

    // if (bunnies.length <= dogs.length) {
    //     console.log('There are more dogs than bunnies');
    // } else {
    //     console.log('There are more bunnies than dogs');
    // }


//20 Conditional statements A bunny's health can be 'healthy', 'sick', or anything else.
    // let health = 'healthy';

    // // if /esle if /else
    //     if (health === 'healthy') {
    //         console.log('The bunny is healthy');
    //     } else if (health === 'sick') {
    //         console.log('The bunny is sick');
    //     } else {
    //         console.log('The bunny is a Nigerian politician, dem no dey normal at all');
    //     }
    
    // // // switch statement
    //     switch (health) {
    //         case 'healthy':
    //             console.log('The bunny is healthy');
    //             break;
    //         case 'sick':
    //             console.log('The bunny is sick');
    //             break;
    //         default:
    //             console.log('The bunny is a Nigerian politician, dem no dey normal at all');
    //     }

    
    // // tenary operator
    //     console.log(health === 'healthy' ? 'The bunny is healthy' : health === 'sick' ? 'The bunny is sick' 
    //         : 'The bunny is a Nigerian politician, dem no dey normal at all');


//21 Write a function that takes a number and uses a ternary operator to return 'even' or 'odd'. Test it with 4, 7, and 0.
    // function OddorEven(num) {
    //     return num % 2 === 0 ? 'even' : 'odd';
    // }
     
    // console.log(OddorEven(4));
    // console.log(OddorEven(7));
    // console.log(OddorEven(0));


//22 Write a for loop that prints Number 0 through Number 9. Then write a while loop that does the same thing.
    //for loop
//      for(let i=0; i < 10; i++) {
//         console.log('Number', i);
//      }
     
//     //while loop
//    let i = 0; 
//    while(i < 10) {
//         console.log('Number', i);
//         i++;
//     }


// 23 Write a while loop that counts down from 9 to 1 and prints each number. Then write the same countdown with a for loop.
    // // while loop
    //     let countDown = 9;
    //     while(countDown >=1) {
    //         console.log(countDown);
    //         countDown--;
    //     }

    // // for loop
    //     for (let i = 9; i >= 1; i--) {
    //         console.log(i);
    //     }


// 24 Write sumBunnies(blackBunnies, whiteBunnies) so that it throws an error if either argument is not a number. Wrap a call to sumBunnies(10, 'twenty') in try / catch and print the error message.
    // function sumBunnies(blackBunnies, whiteBunnies) {
    //     if (typeof blackBunnies !== 'number' || typeof whiteBunnies !== 'number') {
    //         throw new Error('Both arguments must be numbers');
    //     }
    //     return blackBunnies + whiteBunnies;
    // }

    // try {
    //     console.log(sumBunnies(10, 'twenty'));
    // } catch (error) {
    //     console.log('Error:', error.message);
    // }


// 25 Using the operators from this topic, write one small program that: assigns blackBunnies = 10 and whiteBunnies = 5, prints whether they are equal (===), prints the total (+),     prints whether there are more than 12 bunnies in total (&& or > is fine), prints 'Yes' or 'No' with a ternary if the total is greater than 12
    // let blackBunnies = 10;
    // let whiteBunnies = 5;
    // let totalBunnies = blackBunnies + whiteBunnies;

    // console.log('Are the bunnies equal?', blackBunnies === whiteBunnies);
    // console.log('Total bunnies:', totalBunnies);
    // console.log('There are more than 12 bunnies?', totalBunnies > 12);
    // console.log(totalBunnies > 12 ? 'Yes' : 'No');


// Brain Teaser 1
    // let carrots = 3;

    // while (carrots) {
    // console.log('munch');
    // }


// Brain Teaser 2
    // const bunnies = ['Lucy', 'Tom', 'Molly', 'Bella', 'Mario', 'Luigi'];

    // //For loop
    // for (let i = 0; i < bunnies.length; i++) {
    //     if (bunnies[i].length > 4) {
    //         console.log(bunnies[i]);
    //     }
    // }

    // //while loop
    // let i = 0;
    // while (i < bunnies.length) {
    //     if (bunnies[i].length > 4) {
    //         console.log(bunnies[i]);
    //     }
    //     i++;
    // }


// Brain Teaser 3 Nested checkup
    // const nestedArrays = [
    //     ['Lucy', 'Tom'],
    //     ['Molly', 'Bella'],
    //     ['Mario', 'Luigi'],
    // ];

    // let counter = 1;
    // for (let i = 0; i < nestedArrays.length; i++) {
    //     for (let j = 0; j < nestedArrays[i].length; j++) {
    //         console.log(`${counter}. ${nestedArrays[i][j]}`);
    //         counter++;
    //     }
    // }


//Brain Teaser 4 — Loop + condition + function
//     function countHappyBunnies(bunnies) {
//         let count = 0;
//         for (let i = 0; i < bunnies.length; i++) {
//             if (bunnies[i].isHappy === true) {
//             count++;
//         }
//     }
//     return count;
// }

// const bunnies = [
//   { name: 'Lucy', isHappy: true },
//   { name: 'Tom', isHappy: false },
//   { name: 'Molly', isHappy: true },
// ];

// let happyCount = countHappyBunnies(bunnies);
// let half = bunnies.length / 2;

// console.log(happyCount >= half ? 'Most bunnies are happy' : 'Most bunnies are not happy');



// Brain Teaser 5 — The loop that almost lies
// Snippet A
    // for (let i = 0; i < 5; i++) {
    //     console.log(i);
    // }

    // // Snippet B (fixed)
    // let i = 0;
    // while (i < 5) {
    //     console.log(i);
    //     i++; // missing increment was causing infinite loop
    // }

// When to pick for vs while:
    // Use for when you know the number of iterations; use while when the number is unknown or condition-based.