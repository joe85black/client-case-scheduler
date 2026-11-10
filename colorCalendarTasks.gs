/**
 * Color-codes case entries on the "Task Calendar" tab by service package.
 *
 * Each cell in the calendar body can hold multiple lines of text (one line
 * per case shown that day). This scans every line in every cell and, if the
 * line matches one of the package patterns below, recolors just that line's
 * text to the package's color — so cases are visually grouped by package at
 * a glance without needing a legend lookup.
 */
function colorCalendarTasks() {
  const CAL_SHEET_NAME = 'Task Calendar';
  const START = { row: 2, col: 3 }; // C2

  // Patterns are checked in order and the first match wins, so more specific
  // labels ("Quick Check Family", "Quick Check Pro") are listed before the
  // shorter label they contain ("Quick Check"). The plain "Quick Check" rule
  // also uses a negative lookahead so it never claims the longer labels.
  // Patterns ending in ")" deliberately have no trailing \b: a word boundary
  // after ")" only matches when a letter/digit follows it, which would stop
  // the rule from matching a label at the end of a line.
  const colorMap = [
    {pattern:/\bQuick\s+Check\s+Family\b/i,                         color:'#7CB342'},
    {pattern:/\bQuick\s+Check\s+Pro\b/i,                            color:'#4285F4'},
    {pattern:/\bQuick\s+Check\b(?!\s+(?:Pro|Family)\b)/i,           color:'#D29EB7'},
    {pattern:/\bStarter\s+Lite\b/i,                                 color:'#DB4437'},
    {pattern:/\bStarter\s+Full\b/i,                                 color:'#F4B400'},
    {pattern:/\bStarter\s+Filing\b/i,                               color:'#795548'},
    {pattern:/\bBusiness\s+Plus\s+Lite\b/i,                         color:'#00BCD4'},
    {pattern:/\bBusiness\s+Plus\s+Full\b/i,                         color:'#E91E63'},
    {pattern:/\bAnnual\s+Review\s*\(Delivery\)/i,                   color:'#9E9E9E'},
    {pattern:/\bFlex\s+Option\b/i,                                  color:'#F29900'},
    {pattern:/\bGrowth\s+Plan\b/i,                                  color:'#26A69A'},
    {pattern:/\bEssentials\s+Pack\b/i,                              color:'#673AB7'},
    {pattern:/\bPremier\s+Plan\b/i,                                 color:'#212121'},
  ];

  const sh = SpreadsheetApp.getActive().getSheetByName(CAL_SHEET_NAME);
  if (!sh) throw new Error('Sheet "Task Calendar" not found.');

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < START.row || lastCol < START.col) return;

  const numRows = lastRow - START.row + 1;
  const numCols = lastCol - START.col + 1;
  const rng = sh.getRange(START.row, START.col, numRows, numCols);

  const values = rng.getDisplayValues();
  const richGrid = [];

  for (let r = 0; r < numRows; r++) {
    const row = [];
    for (let c = 0; c < numCols; c++) {
      const text = values[r][c] || '';
      // Always build a RichTextValue (even if blank)
      const builder = SpreadsheetApp.newRichTextValue().setText(text);

      if (text) {
        const lines = text.split('\n');
        let offset = 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const start = offset;
          const end = start + line.length; // end is exclusive

          // Only style non-empty lines and valid ranges
          if (line.length > 0 && end <= text.length) {
            let chosen = null;
            for (const rule of colorMap) {
              if (rule.pattern.test(line)) { chosen = rule.color; break; }
            }
            if (chosen) {
              const style = SpreadsheetApp.newTextStyle()
                .setForegroundColor(chosen)
                .build();
              builder.setTextStyle(start, end, style);
            }
          }
          // advance offset: add newline only between lines
          offset = end + (i < lines.length - 1 ? 1 : 0);
        }
      }

      row.push(builder.build());
    }
    richGrid.push(row);
  }

  rng.setRichTextValues(richGrid); // <-- must be a full 2D array of RichTextValue
}
