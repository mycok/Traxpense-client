import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouteChildrenProps } from 'react-router-dom';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Box } from '@material-ui/core';

import ExpenseForm from './ExpenseForm';
import AddCategoryDialog from './shared/AddDialog';
import ErrorAlert from '../../shared/ErrorAlert';

import { useAppDispatch, RootState } from '../../redux/store';
import { fetchCategories, Category } from '../../redux/reducers/category/fetchCategories';
import {
  onValueChange, createExpense, initialCreateExpenseState, reset,
} from '../../redux/reducers/expenses/createExpense';
import { setDidFinishDateRangeSearch } from '../../redux/reducers/expenses/fetchOrDeleteExpenses';
import {
  onCategoryValueChange,
  createCategory,
} from '../../redux/reducers/category/createCategory';

const useStyles = makeStyles(() => createStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

type RouteProps = {
  history: RouteChildrenProps['history'],
};

function NewExpense({ history }: RouteProps) {
  const classes = useStyles();
  const [selectedDate, selectDate] = useState<Date>(new Date());
  const [prefCurrency] = useState<string | null>(localStorage.getItem('currency'));
  const [open, setOpen] = useState(false);
  const [insuffCashBalanceErr, setInsuffCashBalanceErr] = useState<string | null>(null);
  const { wallet } = useSelector((state: RootState) => state.userWallet);
  const dispatch = useAppDispatch();
  const {
    title,
    amount,
    category,
    notes,
    incurredOn,
    isSaving,
  } = useSelector(
    (state: RootState) => state.createExpense,
  );
  const { isLoading, categories } = useSelector(
    (state: RootState) => state.categories,
  );
  const {
    title: categoryTitle,
    isSavingCategory,
    createdCategory,
    didFinishCreatingCategory,
  } = useSelector(
    (state: RootState) => state.createCategory,
  );
  const { didFinishDateRangeSearch } = useSelector(
    (state: RootState) => state.fetchOrDeleteExpenses,
  );

  const expenseFormState = {
    title,
    amount,
    category,
    notes,
    incurredOn,
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch, didFinishCreatingCategory]);

  function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { target: { name, value } } = event;

    if (name === 'category' && value) {
      const selectedCategory = categories.find((cat: Category) => cat.title === value);
      dispatch(onValueChange({ name, value: selectedCategory }));
    } else {
      dispatch(onValueChange({ name, value }));
    }
  }

  function handleDateSelection(date: Date) {
    selectDate(date);
  }

  function handleOnSubmit(event: React.FormEvent<HTMLFormElement>) {
    // TODO: add field validation
    event.preventDefault();

    const newExpense = {
      ...expenseFormState,
      category: { _id: category?._id },
      amount: Number(amount),
      incurredOn: selectedDate,
    };

    if (newExpense.amount <= 0) return;

    if (wallet?.currentBalance as number < newExpense.amount) {
      setInsuffCashBalanceErr('Insufficient Cash Balance');

      return;
    }

    if (didFinishDateRangeSearch) dispatch(setDidFinishDateRangeSearch(false));
    dispatch(createExpense(newExpense, () => history.push('/expenses')));
  }

  // Add new category functionality
  function handleNewCategoryOnChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const { target: { value } } = event;
    dispatch(onCategoryValueChange({ value }));
  }

  function handleSaveNewCategory() {
    dispatch(createCategory({
      title: categoryTitle.charAt(0).toUpperCase() + categoryTitle.substring(1),
    }, handleCloseNewCategoryDialog));
  }

  function handleCloseNewCategoryDialog() {
    setOpen(false);
  }

  function handleOpenNewCategoryDialog() {
    setOpen(true);
  }

  function handleCancel() {
    dispatch(reset(initialCreateExpenseState));
  }

  function handleErrAlertClose() {
    setInsuffCashBalanceErr(null);
  }

  // TODO: add functionality to display toast with server error
  return (
    <Box className={classes.container}>
      <Paper elevation={5}>
        <ExpenseForm
          state={expenseFormState}
          isLoading={isLoading}
          isSaving={isSaving}
          prefCurrency={prefCurrency}
          createdCategory={createdCategory}
          categories={categories}
          path="new-expense"
          selectedDate={selectedDate}
          handleCancel={handleCancel}
          handleOnSubmit={handleOnSubmit}
          handleOnChange={handleOnChange}
          handleDateSelection={handleDateSelection}
          handleShowAddCategoryDialog={handleOpenNewCategoryDialog}
        />
      </Paper>
      <AddCategoryDialog
        open={open}
        isSaving={isSavingCategory}
        label="Title"
        dialogTitle="Add New Category"
        value={categoryTitle}
        inputType="text"
        handleOnChange={handleNewCategoryOnChange}
        handleSave={handleSaveNewCategory}
        handleClose={handleCloseNewCategoryDialog}
      />
      <ErrorAlert
        open={!!insuffCashBalanceErr}
        message={insuffCashBalanceErr as string}
        onClose={handleErrAlertClose}
      />
    </Box>
  );
}

export default NewExpense;
