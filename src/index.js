console.log('Hello world!');

// A map of all the possible ingredients a burger can have
// Numbers correspond to the stage number they are added at
const ingredients = {
    Patty: 1,
    Cheese: 3,
    Bun: 4,
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
    Delivered: 5,
    Completed: 6,
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

function startTurn() {
    readActions();
    // First check if any new orders should be started
    for (let i = 0; i < 3; i++) {
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
            activeOrders[i] = undefined;
        } else {
            activeOrders[i] = order
        }
        // Reset action
        actions[i] = undefined;
        drawSelect(i, order);
    }
    // Turn is complete!
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
    const shouldHaveBun = !!getRandomIntInclusive(0, 1);

    if (shouldHaveCheese) {
        baseIngredients.push(ingredients.Cheese);
    }

    if (shouldHaveBun) {
        baseIngredients.push(ingredients.Bun);
    }
    return {
        ingredients: baseIngredients,
        cookLevel,
        turnsToComplete: baseTurns + cookLevel,
        status: orderStatuses.InProgress,
        burger: generateBurger(),
    };
}

function generateBurger() {
    return {
        ingredients: [],
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
        actions[i] = select.value;
        select.remove();
    }
}
