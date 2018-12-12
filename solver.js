var fild = []
var size = 0; 
var elements = [];
var colors = ["#222222","#000000","#770000","#007700","#000077","#007777","#770077","#777700"]

/*Augments the array with some usefull stuff*/
/*************************************************************************/
Array.prototype.fill_zero = function()
{
    for(var i = 0; i<size; i++) 
    {
        this[i] = [];
        for(var j = 0;j<size;j++)this[i][j] = 0;
    }
}

Array.prototype.copy = function(array)
{
    for(var i = 0; i<array.length; i++) 
    {
        this[i] = [];
        for(var j = 0;j<array[i].length;j++)this[i][j] = array[i][j];
    }
}

Array.prototype.strip_larger = function(x)
{
    for(var i = 0; i<size; i++) 
    {
        for(var j = 0;j<size;j++) if(this[i][j]>x) this[i][j] = 0;
    }
}

Array.prototype.draw = function()
{
    createTable(this);
}

Array.prototype.has_zeros = function()
{
    for(var i = 0; i<size; i++) 
    {
        for(var j = 0;j<size;j++) if(this[i][j] == 0) return true;
    }
    return false;
}

Array.prototype.count_not_zero = function()
{
    var not_zero = 0;

    for(var i = 0; i<this.length; i++) 
    {
        for(var j = 0;j<this[0].length;j++) if(this[i][j] != 0) not_zero++;
    }
    return not_zero;
}

/*************************************************************************/

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

/*some riddels may only be solveble, if the square ist rotated by 90°. 
This function will calculate the "mask" element for those riddles. 
also updates the size of the placement area*/
function create_90_deg_mask()
{
    var mask = [];
    var prev_rows = 0;
    var max_row_lenght = 1;
    while(size*size > (max_row_lenght + prev_rows*2)) 
    {
            prev_rows += max_row_lenght;
            max_row_lenght = max_row_lenght += 2;
    }

    var zeros = 1;
    for(var i=0; i<max_row_lenght; i++)
    {
        mask[i] = [];
        if(i<max_row_lenght/2) zeros += 2*(i!=0);
        else zeros -= 2;
        for(var j = 0; j<max_row_lenght; j++)
        {
            if(j < (max_row_lenght - zeros)/2) mask[i].push(1);
            else if(j < (max_row_lenght - zeros)/2 + zeros) mask[i].push(0);
            else mask[i].push(1);
        }
    }
    //updateing the size of the square
    size = max_row_lenght;

    return mask;
}


/*function to create an html table for an  array*/
function createTable(tableData) {
  var table = document.createElement('table');
  var tableBody = document.createElement('tbody');
  table.style.width = "500px";
  table.style.height = "500px";

  tableData.forEach(function(rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      cell.style.backgroundColor = colors[cellData];
      row.appendChild(cell);
      cell.style.width = (100/size) + "%";
      cell.style.height = (100/size) + "%";
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  document.body.appendChild(table);
}

/*the Elements to be places in a square and their functions for reorienttation*/
function element(layout)
{
    /*will be set once and not modified again. needet to reset an element to its original shape*/
    this.shape = layout;
    /*will be changed regulary to represent difffenrent orientations of the pice*/
    this.cur_shape = [];
    this.cur_shape.copy(this.shape);
    this.shape_counter = 0;
    this.posx = -1;
    this.posy = 0;

    /*mirrors the element*/
    this.mirror = function()
    {
        for(var ar of this.cur_shape)
        {
            for(var i=0; i<(ar.length/2); i++)
            {
                var tmp = ar[i];
                ar[i] = ar[ar.length-1-i]
                ar[ar.length-1-i] = tmp;
            }
        }
    }

    /*rotates the element by 90°*/
    this.rot90 = function()
    {
        var newarr = [];
        for(var i=0; i<this.cur_shape[0].length; i++)
        {
            var tmp = [];
            for(var j=this.cur_shape.length-1; j>=0; j--) 
            {
                tmp.push(this.cur_shape[j][i]);
            }
            newarr.push(tmp);
        }
        this.cur_shape = newarr;
    }

    /*uses mirror and rotation to cycle trough every possibly orientation of the pice.
    will return false, if all 8 combinations are used*/
    this.next_shape = function()
    {
        if(this.shape_counter == 3)
        {
            this.mirror();
            this.shape_counter++;
            return true;
        }else if(this.shape_counter < 7)
        {
            this.rot90();
            this.shape_counter++;
            return true;
        }else return false;   
    }

    /*places a pice on the "square" (a given 2d array) regardless of other elements that might be overwritten*/
    this.place = function(canv,id)
    {
        for(var i=0; i<this.cur_shape.length; i++)
        {
            for(var j=0; j<this.cur_shape[0].length; j++)
            {
                if(this.cur_shape[i][j] == 0) continue;
                canv[i+this.posx][j+this.posy] = id;
            }
        }
    }

    /*checks wether the element can be placed at the current positon without overwriting other elements or exeeding the bounds of the "square" (given 2d array)*/
    this.can_place = function(canv)
    {
    tryed++;
        for(var i=0; i<this.cur_shape.length; i++)
        {
            for(var j=0; j<this.cur_shape[0].length; j++)
            {
                if(this.cur_shape[i][j] == 0) continue;
                if(i+this.posx < canv.length && j+this.posy < canv[0].length)
                {
                    if(canv[i+this.posx][j+this.posy] == 0) continue;
                }
                return false;
            }
        }
        return true;
    }

    /*will attempt to place the element in any orientation at any position in the "square" (given 2d array). When called again, will place the emement at the next passible location in the next possible orientation (hence the name) returns true if succesfull and false if unsuccessfull*/
    this.next = function(canv,id)
    {
        canv.strip_larger(id-1)
        this.posx++;
        if(this.posx > canv.length) 
        {
            this.posy++;
            this.posx = 0;
            if(this.posy > canv[0].length)
            {
                this.posy = 0;
                if(!this.next_shape()) return false;
            }
        }

        if(this.can_place(canv))
        {
            this.place(canv,id);
            return true;
        }else return this.next(canv,id);
    }
    
    /*Returns the element to its default state*/
    this.reset = function()
    {
        this.cur_shape = []
        this.cur_shape.copy(this.shape);
        this.shape_counter = 0;
        this.posx = -1;
        this.posy = 0;
    }

    /*counts how many tiles the element will occupy*/
    this.count_places = function()
    {
        return this.shape.count_not_zero();
    }
}

/*recursivce function to place all elements on the square*/
function place_all(elements,elemid,fild)
{
    if(elemid-1 == elements.length) return true;

    while(elements[elemid-1].next(fild,elemid))
    {
        if(place_all(elements,elemid+1,fild))
        {
            return true;
        }

    }
    elements[elemid-1].reset();
    return false;
}

/*solving the riddle*/
function solve()
{
    tryed = 0;

    //specifying the size of the square
    elements.forEach(function(x){size += x.count_places()});
    size = Math.sqrt(size);
    if(!isInt(size))
    {
        console.log("Riddle cant be solved! parts dont occuby a quadratic space")
        return;
    }

    fild.fill_zero();
    if(place_all(elements,1,fild))
    {
            console.log("solved: " + !fild.has_zeros())
            console.log(tryed);
    }else
    {
        elements.unshift(new element(create_90_deg_mask()));
        fild.fill_zero();
        if(place_all(elements,1,fild))
        {
             console.log("solved: " + !fild.has_zeros())
             console.log(tryed);
        }
    }
    fild.draw()
}

