import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
abstract class cookbookEntry {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
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
}

class ingredient extends cookbookEntry {
  cookTime: number;

  constructor(name: string, cookTime: number) {
    super(name);
    this.cookTime = cookTime;
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
app.get("/summary", (req:Request, res:Request) => {
  const name = req.query.name;
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

  const baseRecipe = cookbook[name];
  if (baseRecipe instanceof ingredient) {
    throw Error(name + 'is an ingredient.');
  }





  /**
   * A recipe with the corresponding name cannot be found.
   * The searched name is NOT a recipe name (ie. an ingredient).
   * The recipe contains recipes or ingredients that aren't in the cookbook.
   */
};

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
