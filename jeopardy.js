let categories = [];

async function getCategoryIds() {
  const response = await axios.get("http://jservice.io/api/categories", {
    params: { count: 100 }
  });
  const categoryIds = _.sampleSize(
    response.data.map(category => category.id),
    6
  );
  return categoryIds;
}

async function getCategory(catId) {
  const response = await axios.get(`http://jservice.io/api/clues`, {
    params: { category: catId }
  });
  const clues = response.data.map(clue => ({
    question: clue.question,
    answer: clue.answer,
    showing: null
  }));
  return { title: response.data[0].category.title, clues: clues };
}

function fillTable() {
    const table = $("<table>");
    const thead = $("<thead>");
    const tbody = $("<tbody>");
  
    const headerRow = $("<tr>");
    for (const category of categories) {
      const headerCell = $("<th>").text(category.title);
      headerRow.append(headerCell);
    }
    thead.append(headerRow);
    table.append(thead);
  
    for (let i = 0; i < 5; i++) {
      const row = $("<tr>");
      for (let j = 0; j < categories.length; j++) {
        const category = categories[j];
        const clue = category.clues[i];
        const value = "?" 
        const cell = $("<td>")
          .addClass("clue")
          .attr("data-row", i)
          .attr("data-cat", category.title)
          .text(value); 
        row.append(cell);
      }
      tbody.append(row);
    }
    table.append(tbody);
  
    $("#jeopardy").html(table);
  }

  function handleClick(evt) {
    const cell = $(evt.target);
    const row = cell.data("row");
    const cat = cell.data("cat");
    const clue = categories.find(category => category.title === cat).clues[row];
  
    if (!clue.showing) {
      cell.text(clue.question);
      clue.showing = "question";
    } else if (clue.showing === "question") {
      cell.empty(); // Clear the cell content
      const answer = $("<span>").html(clue.answer); // Create a span element for the answer
      cell.append(answer); // Append the answer span to the cell
      clue.showing = "answer";
    }
  }

function showLoadingView() {
  $("#jeopardy").empty();
  $("#loading").show();
  $("#restart").prop("disabled", true);
}

function hideLoadingView() {
  $("#loading").hide();
  $("#restart").prop("disabled", false);
}

async function setupAndStart() {
  showLoadingView();

  const categoryIds = await getCategoryIds();
  const categoryPromises = categoryIds.map(getCategory);
  categories = await Promise.all(categoryPromises);

  fillTable();
  hideLoadingView();
}

$("#restart").on("click", setupAndStart);
$(document).on("click", ".clue", handleClick);
$(document).ready(setupAndStart);