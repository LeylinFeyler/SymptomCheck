from flask_wtf import FlaskForm
from wtforms import TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length

class SymptomsForm(FlaskForm):
    symptoms = TextAreaField('Symptoms', validators=[DataRequired(), Length(min=1, max=500)])
    submit = SubmitField('Submit')
