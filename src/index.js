console.log('Hello world!');

// A map of all the possible ingredients a burger can have
// Numbers correspond to the stage number they are added at
const ingredients = {
    Patty: 1,
    Cheese: 3,
    Bun: 4, // Currently this is an implicit argument
};

// A map of all the possible cook levels a burger can have
const cookLevels = {
    Raw: 0,
    Rare: 1,
    Medium: 2,
    Well: 3,
    Burnt: 4,
};

// A map of the possible statuses an order can have
const orderStatuses = {
    Complete: 1,
    Failed: 2,
};

// A map of the the possible options one can take on a give turn
const turnOptions = {
    Hold: 'Hold',
    Next: 'Next',
    Add: 'Add Ingredient',
    Toss: 'Toss',
};

const stages = {
    Conveyor: 1,
    Grill: 2,
    Cheese: 3,
    Staging: 4,
    Completed: 5,
}

// A map of each state along with the allowed transition states from that stage
const stageTransitions = {
    [stages.Conveyor]: [
        turnOptions.Next,
    ],
    [stages.Grill]: [
        turnOptions.Hold,
        turnOptions.Next,
        turnOptions.Toss,
    ],
    [stages.Cheese]: [
        turnOptions.Next,
        turnOptions.Add,
        turnOptions.Toss,
    ],
    [stages.Staging]: [
        turnOptions.Next,
        turnOptions.Add,
        turnOptions.Toss,
    ],
}

// Map of the possible states a stage can be in
const stageStates = {
    Empty: 0,
    Occupied: 1,
}

const exampleBurger = {
    ingredients: [
        ingredients.Patty,
        ingredients.Bun,
        ingredients.Cheese,
    ],
    cookLevel: cookLevels.Medium,
    turnCounter: 4,
    stage: stages.Staging,
};

const exampleOrder = {
    name: 'Michael',
    ingredients: [
        ingredients.Patty,
        ingredients.Bun,
        ingredients.Cheese,
    ],
    cookLevel: cookLevels.Medium,
    turnsToComplete: 5,
    status: orderStatuses.InProgress,
    burger: exampleBurger,
};

let actions = [
    turnOptions.Next,
    turnOptions.Next,
    turnOptions.Next,
]; // Current set of user actions
let activeOrders = [
    generateOrder(),
    generateOrder(),
    generateOrder(),
]; // Current set of orders being fulfilled
let orderHistory = []; // Set of completed/failed orders

let successCount = 0;
let failCount = 0;

function startTurn() {
    readActions();
    console.log(activeOrders);
    console.log(actions);
    // First check if any new orders should be started
    for (let i = 0; i < 3; i++) {
        debugger;
        let order = activeOrders[i];
        let action = actions[i];
        // If there is not an active order in any positon
        if (!order) {
            // Generate a new order
            order = generateOrder();
            activeOrders[i] = order;
            // And set the action to next so it the burger
            // moves from conveyor to the grill
            actions[i] = action = turnOptions.Next;
        }
        // Next handle user actions for the position
        order.burger = handleAction(order.burger, action);

        // Handle completed order
        if (order.burger.stage === stages.Completed) {
            orderHistory.push(order);
            const match = ingredientsMatch(order.ingredients, order.burger.ingredients);
            if (match && order.cookLevel === order.burger.cookLevel && order.turnsToComplete >= order.burger.turnCounter) {
                successCount++;
                document.getElementById('successCount').innerText = successCount;
            } else {
                failCount++;
                document.getElementById('failCount').innerText = failCount;
            }
            order = generateOrder();
            order.burger.stage = stages.Grill;
            activeOrders[i] = order;
        } else {
            activeOrders[i] = order
        }
        drawSelect(i, order);
        // Reset action
        actions[i] = undefined;
    }
    // Turn is complete!
    drawStages();
}

function handleAction(burger, action) {
    burger.turnCounter++;
    switch (action) {
        case turnOptions.Next:
            return { ...burger, stage: burger.stage + 1 };
        case turnOptions.Add:
            return {
                ...burger,
                ingredients: [
                    ...burger.ingredients,
                    burger.stage
                ],
            }
        case turnOptions.Toss:
            return generateBurger();
        case turnOptions.Hold:
            if (burger.stage === stages.Grill) {
                return { ...burger, cookLevel: burger.cookLevel + 1 };
            }
        default:
            return burger;
    }
}

function generateOrder() {
    let baseTurns = 4; // min number of turns to get a burger through
    const cookLevel = getRandomIntInclusive(cookLevels.Rare, cookLevels.Burnt);
    const baseIngredients = [
        ingredients.Patty,
    ];
    const shouldHaveCheese = !!getRandomIntInclusive(0, 1);
    // const shouldHaveBun = !!getRandomIntInclusive(0, 1);
    const shouldHaveBun = false;

    if (shouldHaveCheese) {
        baseIngredients.push(ingredients.Cheese);
    }

    if (shouldHaveBun) {
        baseIngredients.push(ingredients.Bun);
    }
    return {
        name: 'Michael', // TODO use an api
        ingredients: baseIngredients,
        cookLevel,
        turnsToComplete: baseTurns + cookLevel + (shouldHaveCheese ? 1 : 0),
        status: orderStatuses.InProgress,
        burger: generateBurger(),
    };
}

function generateBurger() {
    return {
        ingredients: [
            ingredients.Patty,
        ],
        cookLevel: cookLevels.Raw,
        turnCounter: 0,
        stage: stages.Conveyor,
    }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawSelect(index, order) {
    const stage = document.querySelector(`.grid-row[data-stage="${order.burger.stage}"]`);
    const column = stage.getElementsByClassName('column')[index];
    const select = document.createElement('select');
    select.dataset.column = index;
    const actionsAvailable = stageTransitions[order.burger.stage];
    const defaultOption = document.createElement('option');
    defaultOption.innerText = 'Select an Action';
    select.appendChild(defaultOption);

    for (let action of actionsAvailable) {
        const option = document.createElement('option');
        option.innerText = action;
        option.value = action;
        select.appendChild(option);
    }
    column.appendChild(select);
}

function readActions() {
    const selects = document.getElementsByTagName('select');
    for (let i = selects.length - 1; i >= 0; i--) {
        let select = selects[i];
        console.log(select.value);
        actions[+select.dataset.column] = select.value;
        select.remove();
    }
}

function drawStages() {
    const stages = document.getElementsByClassName('grid-row');
    for (let stage of stages) {
        const stageValue = stage.dataset.stage;
        const columns = stage.getElementsByClassName('column');
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            buildStage(+stageValue, column, activeOrders[i]);
        }
    }
}

function buildStage(stage, column, order) {
    const image = column.getElementsByTagName('img')[0];
    const baseSrc = '../assets/png/';
    // TODO make this more dynamic
    let burger;
    if (order && order.burger && order.burger.stage === stage) {
        burger = order.burger;
    }
    switch (stage) {
        case stages.Grill:
            if (!!burger) {
                const cookLevel = column.getElementsByClassName('cook-level')[0];
                cookLevel.innerText = burger.cookLevel;
                image.src = `${baseSrc}Grill-Burger.png`
                break;
            }
            image.src = `${baseSrc}Grill.png`;
            break;
        case stages.Cheese:
            if (!burger) {
                image.src = `${baseSrc}Cheese.png`
                break;
            }
            if (burger.ingredients.some(i => i === ingredients.Cheese)) {
                image.src = `${baseSrc}Burger-Cheese.png`
                break;
            }
            image.src = `${baseSrc}Burger.png`;
            break;
        case stages.Staging:
            if (!burger) {
                image.src = `${baseSrc}Plate-Bun.png`
                break;
            }
            if (burger.ingredients.some(i => i === ingredients.Cheese)) {
                image.src = `${baseSrc}Plate-Burger-Cheese-Bun.png`
                break;
            }
            image.src = `${baseSrc}Plate-Burger-Bun.png`;
            break;
        case stages.Completed:
            const turnsRemaining = column.getElementsByClassName('time-remaining')[0];
            turnsRemaining.innerText = Math.max(order.turnsToComplete - order.burger.turnCounter, 0);
            const cookLevel = column.getElementsByClassName('cook-level')[0];
            cookLevel.innerText = order.cookLevel;
            if (order.ingredients.some(i => i === ingredients.Cheese)) {
                image.src = `${baseSrc}Plate-Burger-Cheese-Bun.png`
                break;
            }
            image.src = `${baseSrc}Plate-Burger-Bun.png`;
            break;
        default:
            break;
    }
}

function ingredientsMatch(ing1, ing2) {
    if (ing1.length !== ing2.length) return false;

    for (let i = 0; i < ing1.length; i++) {
        if (ing1[i] !== ing2[i]) return false;
    }
    return true;
}
