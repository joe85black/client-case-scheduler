/**
 * Color-codes case entries on the "Task Calendar" tab by case category.
 *
 * Each cell in the calendar body can hold multiple lines of text (one line
 * per case shown that day). This scans every line in every cell and, if the
 * line matches one of the case-category patterns below, recolors just that
 * line's text to the category's color — so cases are visually grouped by
 * category at a glance without needing a legend lookup.
 *
 * Case-category labels are genericized placeholders (Category A-I / Package
 * Type 1-2) — see the Case Category Key in this repo's README. Only the
 * labels were changed; the matching order, regex patterns, and colors are
 * unchanged from the working script.
 */
function colorCalendarTasks() {
  const CAL_SHEET_NAME = 'Task Calendar';
  const START = { row: 2, col: 3 }; // C2

  // NOTE: patterns are checked in order and the first match wins. Because
  // "Category D" and "Category C" are tested before the more specific
  // dependents pattern, a "Category C/D (Dependents)" line will actually
  // match the plain "Category D" (or "Category C") rule first — this
  // matches the original script's behavior and was left as-is.
  const colorMap = [
    {pattern:/\bCategory D\b/i,                          color:'#4285F4'}, // Student-visa case
    {pattern:/\bCategory C\b/i,                           color:'#D29EB7'}, // Visitor-visa case
    {pattern:/\bCategory C\/D\s*\(Dependents\)\b/i,       color:'#7CB342'}, // Visitor/student visa w/ dependents
    {pattern:/\bCategory A\s*\(Economic\)\b/i,            color:'#DB4437'}, // Green-card case, economic package
    {pattern:/\bCategory A\s*\(Complete\)\b/i,            color:'#F4B400'}, // Green-card case, full package
    {pattern:/\bCategory A\s*\(Petition\)\b/i,            color:'#795548'}, // Green-card petition filing
    {pattern:/\bCategory B\s*\(Economic\)\b/i,            color:'#00BCD4'}, // Removal-of-conditions, economic package
    {pattern:/\bCategory B\s*\(Complete\)\b/i,            color:'#E91E63'}, // Removal-of-conditions, full package
    {pattern:/\bCategory E\s*\(Delivery\)\b/i,            color:'#9E9E9E'}, // Citizenship case, delivery stage
    {pattern:/\bCategory F\b/i,                           color:'#F29900'}, // RFE or other misc. filing
    {pattern:/\bCategory G\b/i,                           color:'#26A69A'}, // Student services case
    {pattern:/\bCategory H\b/i,                           color:'#673AB7'}, // Ancillary filing w/ printing
    {pattern:/\bCategory I\b/i,                           color:'#212121'}, // Re-entry permit case
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
