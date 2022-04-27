# Reference

## Dialog Reading

### Functions

**`Text`** - basic string of dialog

**`Check`** - check if a flag (level) is true

**`Toggle`** - Toggle a flag. Use carefully since it is impossible to manually turn a flag off. Manual flag changing requires `exec` 

**`Insert`** - For special cases. Erase and insert a dialog

**`Exec`** - For special cases. Execute a function

**`Continue`** - Move onto the next dialog

**`End`** - End dialog. Dialog MUST be ended.

### Modifiers

`and` - Read another dialog. Does not require user input (Essentially allows 2 dialogs to be run at once). Might break with `check` (idk).