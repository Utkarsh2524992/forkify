import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.ingredients = res.data.recipe.ingredients;
            this.url = res.data.recipe.source_url;
            
        }
        catch(error) {
            console.log(error);
            alert('Something went wrong:(');
        }

    }
    calcTime() {
        //Assuming every 3 ingredients take 15 minutes.
        const numIngs = this.ingredients.length;
        const periods = Math.ceil(numIngs/3);
        this.time = periods*15;
    }
    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds'];
        const unitsShort = ['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
        const units = [...unitsShort,'kg','g'];

        const newIngredients = this.ingredients.map(el => {
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit,i) => {
                ingredient = ingredient.replace(unit,unitsShort[i]);
            })
            // 2) Remove paranthesis
            ingredient = ingredient.replace(/[\])}[{(]/g, ' ');

            // 3) Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');

            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if(unitIndex > -1) {
                //There is a unit
                const arrCount = arrIng.slice(0,unitIndex);// Ex. 4 1/2 cups arrCount will be [4,1/2]
                let count;
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-','+'));
                }
                else {
                    count = eval(arrIng.slice(0,unitIndex).join('+'));// arrCount = [4,1/2] ==> "4+1/2" ==> 4.5
                }
                objIng = {
                    unit:arrIng[unitIndex],
                    count,
                    ingredient: arrIng.slice(unitIndex+1).join(' ')
                }
            }
            else if(parseInt(arrIng[0],10)) {
                //There is NO unit, but 1st element is number
                objIng = {
                    unit: '',
                    count: parseInt(arrIng[0],10),
                    ingredient: arrIng.slice(1).join(' ')
                }
            }
            else if (unitIndex === -1) {
                //There is NO unit and NO number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        //Servings
        const newServings = type === 'dec' ? this.servings -1: this.servings + 1;
        

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings/this.servings);
        });

        this.servings = newServings;
    }
}