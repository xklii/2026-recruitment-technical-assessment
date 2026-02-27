import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
abstract class cookbookEntry {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  abstract resolve(resolveMap: Map<string, number>, multiplier: number);
}

interface requiredItem {
  name: string;
  quantity: number;
}
class recipe extends cookbookEntry {
  requiredItems: requiredItem[];

  constructor(name: string, requiredItems: requiredItem[]) {
    super(name);
    this.requiredItems = requiredItems;
  }

  resolve(resolveMap: Map<string, number>, multiplier: number) {
    for (const entry of this.requiredItems) {
      const curr = cookbook.get(entry.name);
      if (curr == undefined) {
        throw Error('The item' + entry.name + 'cannot be found.');
      }
      curr.resolve(resolveMap, multiplier * entry.quantity);
    }
    return { }
  }

}

class ingredient extends cookbookEntry {
  cookTime: number;

  constructor(name: string, cookTime: number) {
    super(name);
    this.cookTime = cookTime;
  }
  resolve(resolveMap: Map<string, number>, multiplier: number) {
    if (resolveMap.get(this.name) === undefined) {
          resolveMap.set(this.name, 0 + multiplier);
        } else {
          resolveMap.set(this.name, resolveMap.get(this.name) + multiplier);
        }
  }
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
// maps a name to an existing entry (if add_entry was used)
const cookbook = new Map<string, cookbookEntry>();
// lazy lookup thing for part 3
const ingredients = new Map<string, ingredient>();

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  const dash_to_wspace = /-|_/g;
  const only_alphabetical = /[^a-zA-Z ]/g;
  // also collapses whitespace
  const remove_dashes = (recipeName.replace(dash_to_wspace, ' ')).replace(/ +/g, ' ');
  const remove_non_alpha = remove_dashes.replace(only_alphabetical, '').toLowerCase();

  if (remove_non_alpha.length === 0) {
    return null;
  }
  const capitalised_list = remove_non_alpha.split(' ').map(x => x[0].toUpperCase() + x.slice(1));

  const res = capitalised_list.join(' ');
  return res;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const { type, name } = req.body;
  let extra;
  // typeguarding due to dual type nature 
  if ('requiredItems' in req.body) {
    extra = req.body.requiredItems;
  } else if ('cookTime' in req.body) {
    extra = req.body.cookTime;
  }

  try {
    const result = add_entry(type, name, extra);
    res.send(200);
  } catch (err) {
    res.status(400).send(err);
  }
});

const add_entry = (type: string, name: string, extra: number|requiredItem[]) => {
  // errors: if the name already exists, if cooktime < 0, type is not recipe/ingredient
  if (type !== 'recipe' && type !== 'ingredient') {
    throw Error('Type must be recipe/ingredient');
  } else if (cookbook.has(name)) {
    throw Error('Name already exists');
  }

  if (typeof extra === 'number') {
    if (extra < 0) {
      throw Error('Cook time must be a non negative number');
    } else {
      const newEntry = new ingredient(name, extra);
      cookbook.set(name, newEntry);
      ingredients.set(name, newEntry);
    }
  } else {
    // Recipe requiredItems can only have one element per name.
    const copy_required_items = new Set(extra.slice().map(x => x.name));
    // diff lengths means theres dupes
    if (copy_required_items.size !== extra.length) {
      throw Error('Recipe requiredItems can only have one element per name');
    } else {
      cookbook.set(name, new recipe(name, extra));
    }
  }

  return { };
};



// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Response) => {
  const name = req.query.name as string;
  try {
    const result = summarise(name);
    res.json(result);
  } catch (err) {
    res.status(400).send(err);
  }
});

const summarise = (name: string) => {
  // algo: take recipe and recursively determine base ingredients + decompose nested recipes
  if (!cookbook.has(name)) {
    throw Error('The item' + name + 'cannot be found.');
  } 
  if (cookbook.get(name) instanceof ingredient) {
    throw Error(name + 'is an ingredient.');
  }

  const baseRecipe = cookbook.get(name) as recipe;

  // name, quantity pair
  let resolvedIngredients = new Map<string, number>();

  baseRecipe.resolve(resolvedIngredients, 1);
  
  // now using the map, calculate actual cooktime
  let currTime = 0;
  for (const [key, value] of resolvedIngredients) {
    const currIngredient = ingredients.get(key);
    currTime += currIngredient.cookTime * value;
  }
  // maps the map into the required list
  const ingredientsArray = Array.from(resolvedIngredients, ([name, quantity]) => ({
    name, quantity
  }));

  const res = {
    name: name,
    cookTime: currTime,
    ingredients:  ingredientsArray
  }

  return res;
};

/**
 * Multiplier accumulates to the total of an ingredient used, nested within any number of recipes.
 */
const resolve = (resolveMap: Map<string, number>, currEntry: requiredItem, multiplier: number) => {
  const curr = cookbook.get(currEntry.name);
  if (curr == undefined) {
    throw Error('The item' + currEntry.name + 'cannot be found.');
  }

  if (curr instanceof ingredient) {
    if (resolveMap.get(curr.name) === undefined) {
      resolveMap.set(curr.name, 0 + multiplier);
    } else {
      resolveMap.set(curr.name, resolveMap.get(curr.name) + multiplier);
    }
  } else if (curr instanceof recipe) {
    for (const entry of curr.requiredItems) {
      resolve(resolveMap, entry, multiplier * entry.quantity);
    }
  } else {
    // this shouldnt throw ever
    throw Error('Item is not a cookbook recipe');
  }
  return { }
}

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
