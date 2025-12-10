export namespace dto {
	
	export class ClientOutput {
	    id: number;
	    name: string;
	    email: string;
	    website: string;
	    avatar: string;
	    contactPerson: string;
	    address: string;
	    currency: string;
	    status: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new ClientOutput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.email = source["email"];
	        this.website = source["website"];
	        this.avatar = source["avatar"];
	        this.contactPerson = source["contactPerson"];
	        this.address = source["address"];
	        this.currency = source["currency"];
	        this.status = source["status"];
	        this.notes = source["notes"];
	    }
	}
	export class CreateClientInput {
	    name: string;
	    email: string;
	    website: string;
	    avatar: string;
	    contactPerson: string;
	    address: string;
	    currency: string;
	    status: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateClientInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.email = source["email"];
	        this.website = source["website"];
	        this.avatar = source["avatar"];
	        this.contactPerson = source["contactPerson"];
	        this.address = source["address"];
	        this.currency = source["currency"];
	        this.status = source["status"];
	        this.notes = source["notes"];
	    }
	}
	export class InvoiceItemInput {
	    description: string;
	    quantity: number;
	    unitPrice: number;
	    amount: number;
	
	    static createFrom(source: any = {}) {
	        return new InvoiceItemInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.description = source["description"];
	        this.quantity = source["quantity"];
	        this.unitPrice = source["unitPrice"];
	        this.amount = source["amount"];
	    }
	}
	export class CreateInvoiceInput {
	    clientId: number;
	    number: string;
	    issueDate: string;
	    dueDate: string;
	    subtotal: number;
	    taxRate: number;
	    taxAmount: number;
	    total: number;
	    status: string;
	    items: InvoiceItemInput[];
	
	    static createFrom(source: any = {}) {
	        return new CreateInvoiceInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.clientId = source["clientId"];
	        this.number = source["number"];
	        this.issueDate = source["issueDate"];
	        this.dueDate = source["dueDate"];
	        this.subtotal = source["subtotal"];
	        this.taxRate = source["taxRate"];
	        this.taxAmount = source["taxAmount"];
	        this.total = source["total"];
	        this.status = source["status"];
	        this.items = this.convertValues(source["items"], InvoiceItemInput);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CreateProjectInput {
	    clientId: number;
	    name: string;
	    description: string;
	    hourlyRate: number;
	    currency: string;
	    status: string;
	    deadline: string;
	    tags: string[];
	
	    static createFrom(source: any = {}) {
	        return new CreateProjectInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.clientId = source["clientId"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.hourlyRate = source["hourlyRate"];
	        this.currency = source["currency"];
	        this.status = source["status"];
	        this.deadline = source["deadline"];
	        this.tags = source["tags"];
	    }
	}
	export class CreateTimeEntryInput {
	    projectId: number;
	    date: string;
	    startTime: string;
	    endTime: string;
	    durationSeconds: number;
	    description: string;
	    invoiced: boolean;
	
	    static createFrom(source: any = {}) {
	        return new CreateTimeEntryInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.projectId = source["projectId"];
	        this.date = source["date"];
	        this.startTime = source["startTime"];
	        this.endTime = source["endTime"];
	        this.durationSeconds = source["durationSeconds"];
	        this.description = source["description"];
	        this.invoiced = source["invoiced"];
	    }
	}
	
	export class InvoiceItemOutput {
	    id: number;
	    description: string;
	    quantity: number;
	    unitPrice: number;
	    amount: number;
	
	    static createFrom(source: any = {}) {
	        return new InvoiceItemOutput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.description = source["description"];
	        this.quantity = source["quantity"];
	        this.unitPrice = source["unitPrice"];
	        this.amount = source["amount"];
	    }
	}
	export class InvoiceOutput {
	    id: number;
	    clientId: number;
	    number: string;
	    issueDate: string;
	    dueDate: string;
	    subtotal: number;
	    taxRate: number;
	    taxAmount: number;
	    total: number;
	    status: string;
	    items: InvoiceItemOutput[];
	
	    static createFrom(source: any = {}) {
	        return new InvoiceOutput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.clientId = source["clientId"];
	        this.number = source["number"];
	        this.issueDate = source["issueDate"];
	        this.dueDate = source["dueDate"];
	        this.subtotal = source["subtotal"];
	        this.taxRate = source["taxRate"];
	        this.taxAmount = source["taxAmount"];
	        this.total = source["total"];
	        this.status = source["status"];
	        this.items = this.convertValues(source["items"], InvoiceItemOutput);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ProjectOutput {
	    id: number;
	    clientId: number;
	    name: string;
	    description: string;
	    hourlyRate: number;
	    currency: string;
	    status: string;
	    deadline: string;
	    tags: string[];
	
	    static createFrom(source: any = {}) {
	        return new ProjectOutput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.clientId = source["clientId"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.hourlyRate = source["hourlyRate"];
	        this.currency = source["currency"];
	        this.status = source["status"];
	        this.deadline = source["deadline"];
	        this.tags = source["tags"];
	    }
	}
	export class TimeEntryOutput {
	    id: number;
	    projectId: number;
	    date: string;
	    startTime: string;
	    endTime: string;
	    durationSeconds: number;
	    description: string;
	    invoiced: boolean;
	
	    static createFrom(source: any = {}) {
	        return new TimeEntryOutput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.date = source["date"];
	        this.startTime = source["startTime"];
	        this.endTime = source["endTime"];
	        this.durationSeconds = source["durationSeconds"];
	        this.description = source["description"];
	        this.invoiced = source["invoiced"];
	    }
	}
	export class UpdateClientInput {
	    id: number;
	    name: string;
	    email: string;
	    website: string;
	    avatar: string;
	    contactPerson: string;
	    address: string;
	    currency: string;
	    status: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateClientInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.email = source["email"];
	        this.website = source["website"];
	        this.avatar = source["avatar"];
	        this.contactPerson = source["contactPerson"];
	        this.address = source["address"];
	        this.currency = source["currency"];
	        this.status = source["status"];
	        this.notes = source["notes"];
	    }
	}
	export class UpdateInvoiceInput {
	    id: number;
	    clientId: number;
	    number: string;
	    issueDate: string;
	    dueDate: string;
	    subtotal: number;
	    taxRate: number;
	    taxAmount: number;
	    total: number;
	    status: string;
	    items: InvoiceItemInput[];
	
	    static createFrom(source: any = {}) {
	        return new UpdateInvoiceInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.clientId = source["clientId"];
	        this.number = source["number"];
	        this.issueDate = source["issueDate"];
	        this.dueDate = source["dueDate"];
	        this.subtotal = source["subtotal"];
	        this.taxRate = source["taxRate"];
	        this.taxAmount = source["taxAmount"];
	        this.total = source["total"];
	        this.status = source["status"];
	        this.items = this.convertValues(source["items"], InvoiceItemInput);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class UpdateProjectInput {
	    id: number;
	    clientId: number;
	    name: string;
	    description: string;
	    hourlyRate: number;
	    currency: string;
	    status: string;
	    deadline: string;
	    tags: string[];
	
	    static createFrom(source: any = {}) {
	        return new UpdateProjectInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.clientId = source["clientId"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.hourlyRate = source["hourlyRate"];
	        this.currency = source["currency"];
	        this.status = source["status"];
	        this.deadline = source["deadline"];
	        this.tags = source["tags"];
	    }
	}
	export class UpdateTimeEntryInput {
	    id: number;
	    projectId: number;
	    date: string;
	    startTime: string;
	    endTime: string;
	    durationSeconds: number;
	    description: string;
	    invoiced: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UpdateTimeEntryInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.projectId = source["projectId"];
	        this.date = source["date"];
	        this.startTime = source["startTime"];
	        this.endTime = source["endTime"];
	        this.durationSeconds = source["durationSeconds"];
	        this.description = source["description"];
	        this.invoiced = source["invoiced"];
	    }
	}

}

