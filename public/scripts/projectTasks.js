function toggleNewTaskForm() {
  const dialog = document.getElementById("create-task-dialog");
  dialog.open ? dialog.close() : dialog.showModal();
}

document
  .querySelector("#new-task-button")
  .addEventListener("click", toggleNewTaskForm);

document
  .querySelector("#create-task-dialog")
  .addEventListener("click", function (e) {
    if (e.target === this) this.close();
  });

document.addEventListener("DOMContentLoaded", () => {
  const weightRange = document.getElementById("taskWeightRange");
  const valueOutput = document.getElementById("taskWeightValue");

  if (weightRange && valueOutput) {
    // Ensure initial displayed value matches the input value
    valueOutput.textContent = weightRange.value;

    // Update as the user moves the slider
    weightRange.addEventListener("input", (e) => {
      valueOutput.textContent = e.target.value;
    });
  }
});
