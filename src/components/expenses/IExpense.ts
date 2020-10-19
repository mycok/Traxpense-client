export interface IExpense {
    _id?: string;
    title: string;
    amount: number;
    category: {
        _id: string,
        title: string,
    };
    notes?: string;
    incurredOn: any
}
