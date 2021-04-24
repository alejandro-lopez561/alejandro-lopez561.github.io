// Creating the modules
let budgetController = (function(){
    
    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let calcualteTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    }

    //create a proper data-structure to store the objects created by the function constructor
    let data = {
        allItems: {
            exp: [],
            inc: [] 
        },

        totals: {
            exp: 0,
            inc: 0
        },
        percentage: -1,
        budget: 0
    };

    return {
        //if someone calls the method, what do they have to tell us in order to add a new item (type, des,val)
        addItem: function(type, desc, val){
            let newItem, ID;
            // retreive the data from the user input and create the new instance of the income / expense object
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id +1;
            } else {
                ID = 0;
            }
                  
            if(type === 'exp'){
                newItem = new Expense(ID, desc, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, desc, val);
            }

            //then store the data in our data structure (data.allItems.)
            data.allItems[type].push(newItem);
            // then return the newItem created to the other modules call it
            return newItem;
        },

        deleteItem: function(type, id){
            let index, ids;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            data.allItems[type].splice(index, 1);

        },

        calculateBudget: function(){
            //total incomes and expenses
            calcualteTotal('exp');
            calcualteTotal('inc');

            //budget = incomes - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            let allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
                allInc: data.allItems.inc,
                allExp: data.allItems.exp
            }
        },

        test: function(){
            console.log(data);
        }
    };

})();



let UIController = (function(){
   
    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetValue: '.budget__value',
        budgetIncValue: '.budget__income--value',
        budgetExpValue: '.budget__expenses--value',
        budgetPercentage: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        initBtn: '.init__btn',
        monthLabel: '.budget__title--month'
    };

    let formatNumber = function(num, type){
        let numSplit, int, dec;
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 6) {
            int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        } else if(int.length < 6 && int.length > 3){
            int = int.substr(0, int.length -3) + ',' + int.substr(int.length - 3, int.length);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    let nodeListForEach = function(list, callback){
        for(let i = 0; i < list.length; i++){
            callback(list[i], i)
        }
    };
    //write a method to get our input
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){
            let html, newHtml, element;
            
            // Create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

        deleteListItem: function(selectorID){
            let el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);
        },

        displayBudget: function(obj){
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetIncValue).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.budgetExpValue).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.budgetPercentage).textContent = obj.percentage + '%';    
            } else {
                document.querySelector(DOMstrings.budgetPercentage).textContent = '---';
            }
            
        },

        clearFields: function(){
            let fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields); //this returns an array

            fieldsArr.forEach(element => {
                element.value = "";
            });

            fieldsArr[0].focus();
        },

        displayMonth: function(){
            let now, months, month, year;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;
        },

        displayPercentages: function(percentages){
            let fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

                nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                    
            });
        },

        changedType: function(){
            let fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputValue + ',' + DOMstrings.inputDescription);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function(){
            return DOMstrings;
        }
    };
})();



let controller = (function(budgetCtrl, UICtrl){
        
    let setupEventListeners = function(){
        let DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e){
            if(e.key === 'Enter' || e.code === 'Enter'){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.initBtn).addEventListener('click', reStartBudget);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    let reStartBudget = function(){
        window.location.reload();
        return false;
    };


    let updateBudget = function(){
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        let budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    }

    let updatePercentages = function(){
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        console.log(percentages);

    };

    let ctrlAddItem = function(){
        // 1. Get the field input data
        let input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            let newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //console.log(newItem);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = function(event){
        let itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        //if the ID exists
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = Number(splitID[1]);

            //1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            //2. Delete item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. Update percentages
            updatePercentages();

        }
    };

    // return an object {}
    return {
        init: function(){
            console.log('App running!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();


const cleanNames = function(arr){
    arr.map(el => el.trim);
    return arr;
}

cleanNames([' john ', ' mark']);