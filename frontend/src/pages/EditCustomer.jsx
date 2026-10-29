import { useEffect, useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomer, updateCustomer } from "../api/customerApi";

export default function EditCustomer() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({

        name: "",
        email: "",
        mobile: "",
        company: "",
        designation: "",
        state: "",
        comments: "",
        prediction: "",
        recommended_action: ""

    });

    useEffect(() => {

        loadCustomer();

    }, []);

    async function loadCustomer() {

        try {

            const customer = await getCustomer(id);

            setFormData(customer);

        } catch (err) {

            console.log(err);

            alert("Unable to load customer");

        }

    }

    function handleChange(e) {

        setFormData({

            ...formData,
            [e.target.name]: e.target.value

        });

    }

    async function handleSubmit(e) {

        e.preventDefault();

        try {

            await updateCustomer(id, formData);

            alert("Customer Updated Successfully");

            navigate("/dashboard");

        } catch (err) {

            console.log(err);

            alert("Update Failed");

        }

    }

    return (

        <Card className="p-4">

            <h2>Edit Customer</h2>

            <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Mobile</Form.Label>
                    <Form.Control
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Company</Form.Label>
                    <Form.Control
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Designation</Form.Label>
                    <Form.Control
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Comments</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Prediction</Form.Label>
                    <Form.Control
                        name="prediction"
                        value={formData.prediction}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Recommended Action</Form.Label>
                    <Form.Control
                        name="recommended_action"
                        value={formData.recommended_action}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Button type="submit">
                    Update Customer
                </Button>

            </Form>

        </Card>

    );

}